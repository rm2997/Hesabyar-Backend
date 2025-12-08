import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Unit } from './unit.entity';
import { MssqlService } from 'src/mssql/mssql.service';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    private readonly dataSource: DataSource,
    private readonly mssqlService: MssqlService,
  ) {}

  async createUnit(data: Partial<Unit>, user: number): Promise<Unit> {
    const nameExist = await this.unitRepository.findOne({
      where: {
        unitName: data.unitName?.trim(),
      },
    });
    if (nameExist != null) {
      throw new BadRequestException('این واحد قبلا ثبت شده است');
    }

    const Unit = this.unitRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: { id: user },
    });
    try {
      const result = await this.mssqlService.addNewUnit(data?.unitName!);
      if (result.result == 'ok') {
        const saved = await this.unitRepository.save(Unit);
        return saved;
      } else throw new BadRequestException('مشکلی در درج اطلاعات رخ داد');
    } catch (errno) {
      throw new BadRequestException('مشکلی در درج اطلاعات رخ داد');
    }
  }

  async getAllUnits(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Unit[] }> {
    const query = this.dataSource
      .getRepository(Unit)
      .createQueryBuilder('unit');

    if (search) {
      isNaN(Number(search))
        ? query.andWhere('unit.unitName LIKE :search', {
            search: `%${search}%`,
          })
        : query.andWhere('unit.sepidarId= :search', { search: search });
    }
    const total = await query.getCount();

    const items = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('unit.id', 'DESC')
      .getMany();

    return { items, total };
  }

  async getUnitById(id: number): Promise<Unit | null> {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) throw new NotFoundException();

    return unit;
  }

  async updateUnit(id: number, data: Partial<Unit>): Promise<Unit | null> {
    const unit = await this.unitRepository.findOne({
      where: { id: id },
    });
    if (!unit) throw new NotFoundException();
    const nameExist = await this.unitRepository.findOne({
      where: {
        unitName: data.unitName?.trim(),
        id: Not(id),
      },
    });
    if (nameExist != null) {
      throw new BadRequestException('امکان ثبت واحد تکراری وجود ندارد');
    }

    unit.unitName = data?.unitName!;
    unit.unitInfo = data?.unitInfo!;
    console.log(Unit);

    return this.unitRepository.save(unit);
  }

  async deleteUnit(id: number): Promise<void> {
    const unit = await this.unitRepository.findOne({
      where: { id: id },
    });
    if (!unit) throw new NotFoundException();

    try {
      await this.unitRepository.delete(id);
    } catch (error) {
      console.log(error);
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451)
        throw new BadRequestException(
          'اطلاعات این واحد درحال استفاده میباشد، امکان حذف وجود ندارد',
        );
      else
        throw new BadRequestException('خطای داخلی سرور، امکان حذف وجود ندارد');
    }
  }
}
