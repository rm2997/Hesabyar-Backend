import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Good } from './good.entity';
import { UnitsService } from 'src/units/units.service';
import { User } from 'src/users/users.entity';
import { MssqlService } from 'src/mssql/mssql.service';

@Injectable()
export class GoodsService {
  constructor(
    private readonly mssqlService: MssqlService,
    @InjectRepository(Good)
    private readonly goodRepository: Repository<Good>,
    private readonly unitService: UnitsService,
    private readonly dataSource: DataSource,
  ) {}

  async createGood(data: Partial<Good>, user: number): Promise<Good> {
    const nameExist = await this.goodRepository.findOne({
      where: {
        goodName: data.goodName?.trim(),
      },
    });
    if (nameExist != null) {
      throw new BadRequestException('این کالا قبلا ثبت شده است');
    }
    const Good = this.goodRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: { id: user },
    });
    const saved = await this.goodRepository.save(Good);
    return saved;
  }

  async createGoodFromExcelFile(data: any[], user: User) {
    let counter = 0;
    const unit = await this.unitService.getUnitById(1);
    data.forEach(async (record) => {
      const fieldNames = Object.keys(record);
      const sepidarId = record[fieldNames[2]];
      const goodName = record[fieldNames[3]];

      const Good = this.goodRepository.create({
        goodInfo: 'آپلود دسته ای',
        goodName: goodName,
        goodPrice: 0,
        sepidarId: sepidarId,
        goodUnit: unit!,
        createdAt: new Date(),
        createdBy: user,
      });
      await this.goodRepository.save(Good);
      counter++;
    });
    return { message: 'درج اطلاعات کالا توسط فایل انجام شد', rows: counter };
  }

  async getAllGoods(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Good[] }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const query = queryRunner.manager
        .getRepository(Good)
        .createQueryBuilder('good')
        .leftJoinAndSelect('good.goodUnit', 'unit');

      if (search) {
        isNaN(Number(search))
          ? query.andWhere('good.goodName LIKE :search', {
              search: `%${search.trim()}%`,
            })
          : query
              .andWhere('good.sepidarId= :search', { search: search })
              .orWhere('good.sepidarCode= :search', { search: search });
      }

      const total = await query.getCount();

      const items = await query
        .skip(limit == -1 ? 0 : (page - 1) * limit)
        .take(limit == -1 ? undefined : limit)
        .orderBy('good.id', 'DESC')
        .getMany();
      queryRunner.commitTransaction();
      const sepidarItems = await this.mssqlService.getAllExistItems();
      for (const g of items) {
        for (const i of sepidarItems) {
          if (i.ItemRef == g.sepidarId) g.goodCount = i.Quantity;
        }
      }
      return { items, total };
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      queryRunner.release();
    }
  }

  async getGoodsByCount(count: number): Promise<Good[]> {
    return await this.goodRepository.find();
  }

  async getGoodById(id: number): Promise<Good | null> {
    const Good = await this.goodRepository.findOne({ where: { id } });
    if (!Good) throw new NotFoundException();
    const sepidarItem = await this.mssqlService.getItemById(Good.sepidarId);
    Good.goodCount = sepidarItem[0]?.Quantity ?? 0;
    return Good;
  }

  async getGoodByName(name: string): Promise<Good[] | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const query = queryRunner.manager
        .getRepository(Good)
        .createQueryBuilder('good')
        .leftJoinAndSelect('good.goodUnit', 'unit')
        .andWhere('good.goodName LIKE :search', { search: `${name}%` })
        .orderBy('good.id', 'DESC');
      const goods = query.take(10).getMany();
      await queryRunner.commitTransaction();
      return goods;
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      queryRunner.release();
    }
  }

  async updateGood(id: number, data: Partial<Good>): Promise<Good | null> {
    const Good = await this.goodRepository.findOne({
      where: { id: id },
    });
    if (!Good) throw new NotFoundException();

    const nameExist = await this.goodRepository.findOne({
      where: {
        goodName: data.goodName?.trim(),
        id: Not(id),
      },
      relations: ['goodUnit'],
    });
    if (nameExist != null) {
      throw new BadRequestException('امکان ثبت تکراری کالا وجود ندارد');
    }

    const unit = await this.unitService.getUnitById(data?.goodUnit?.id!);
    if (!unit)
      throw new NotFoundException('واحد انتخاب شده در دیتابیس وجود ندارد');
    Good.goodName = data?.goodName!;
    Good.goodUnit = unit;
    Good.goodInfo = data?.goodInfo!;
    console.log(Good);

    return this.goodRepository.save(Good);
  }

  async deleteGood(id: number): Promise<void> {
    const Good = await this.goodRepository.findOne({
      where: { id: id },
    });
    if (!Good) throw new NotFoundException();

    await this.goodRepository.delete(id);
  }
}
