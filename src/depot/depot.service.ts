import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Depot } from './depot.entity';
import { DepotTypes } from 'src/common/decorators/depotTypes.enum';
import { DepotGoods } from './depot-goods.entity';
import { User } from 'src/users/users.entity';

@Injectable()
export class DepotService {
  constructor(
    @InjectRepository(Depot)
    private readonly depotRepository: Repository<Depot>,
    @InjectRepository(DepotGoods)
    private readonly depotGoodsRepository: Repository<DepotGoods>,
    private readonly dataSource: DataSource,
  ) {}

  async createDepot(data: Partial<Depot>, user: User): Promise<Depot> {
    const depotGoods = [...data?.depotGoods!];
    if (!depotGoods)
      throw new BadRequestException(
        'هیچ کالایی برای خروج از انبار تعیین نشده است',
      );
    depotGoods.map((g) => {
      g.createdAt = new Date();
      g.createdBy = user;
    });
    const depot = this.depotRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: user,
    });

    const saved = await this.depotRepository.save(depot);
    return saved;
  }

  // async saveDepotImages(depotId: number, imagePaths: string[]) {
  //   for (const path of imagePaths) {
  //     await this.depotGoodsRepository.create({
  //       data: {
  //         imageUrl: path,
  //         depotId: depotId,
  //       },
  //     });
  //   }
  // }

  async getAllInputDepots(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Depot[] }> {
    const query = this.dataSource
      .getRepository(Depot)
      .createQueryBuilder('depot')
      .where('depot.depotType= :type', { type: DepotTypes.in })
      .leftJoinAndSelect('depot.depotInvoice', 'invoice')
      .leftJoinAndSelect('depot.depotGoods', 'depotGoods')
      .leftJoinAndSelect('depotGoods.good', 'good')
      .leftJoinAndSelect('good.goodUnit', 'unit')
      .leftJoinAndSelect('depotGoods.issuedBy', 'customer')
      .leftJoinAndSelect('depot.createdBy', 'user');

    if (search) {
      query.andWhere(`depot.id=${search}`);
    }

    const total = await query.getCount();

    const items = await query
      .skip(limit == -1 ? 0 : (page - 1) * limit)
      .take(limit == -1 ? undefined : limit)
      .orderBy('good.id', 'DESC')
      .getMany();

    return { items, total };
  }

  async getAllOutputDepots(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Depot[] }> {
    const query = this.dataSource
      .getRepository(Depot)
      .createQueryBuilder('depot')
      .where('depot.depotType= :type', { type: DepotTypes.out })
      .leftJoinAndSelect('depot.depotInvoice', 'invoice')
      .leftJoinAndSelect('depot.depotGoods', 'depotGoods')
      .leftJoinAndSelect('depotGoods.good', 'good')
      .leftJoinAndSelect('good.goodUnit', 'unit')
      .leftJoinAndSelect('depotGoods.issuedBy', 'customer')
      .leftJoinAndSelect('depot.createdBy', 'user');

    if (search) {
      query.andWhere(`depot.id=${search}`);
    }

    const total = await query.getCount();

    const items = await query
      .skip(limit == -1 ? 0 : (page - 1) * limit)
      .take(limit == -1 ? undefined : limit)
      .orderBy('good.id', 'DESC')
      .getMany();

    return { items, total };
  }

  async getDepotById(id: number): Promise<Depot | null> {
    const depot = await this.depotRepository.findOne({
      where: { id },
      relations: ['depotGood'],
    });
    if (!depot) throw new NotFoundException();

    return depot;
  }

  async getDepotGoodById(id: number): Promise<DepotGoods | null> {
    const depotGood = await this.depotGoodsRepository.findOne({
      where: { id },
    });
    if (!depotGood) throw new NotFoundException('رکورد مورد نظر وجود ندارد');

    return depotGood;
  }

  async updateDepot(
    id: number,
    data: Partial<Depot>,
    user: User,
  ): Promise<Depot | null> {
    const depot = await this.depotRepository.findOne({
      where: { id: id },
      relations: ['depotGoods'],
    });
    if (!depot) throw new NotFoundException('اطلاعات انبار وجود ندارد');
    console.log('Depot found:', depot);

    if (data.isAccepted) {
      data.acceptedBy = user;
      console.log('accepted user added....');
    }
    console.log(data);

    const res = await this.depotRepository.save({ ...depot, ...data });
    return res;
  }

  async updateDepotGood(
    id: number,
    data: Partial<Depot>,
  ): Promise<DepotGoods | null> {
    const depotGood = await this.depotGoodsRepository.findOne({
      where: { id: id },
    });
    if (!depotGood) throw new NotFoundException('اطلاعات موردنظر وجود ندارد');
    const res = await this.depotGoodsRepository.save({ ...depotGood, ...data });
    return res;
  }

  async deleteDepot(id: number): Promise<void> {
    const Depot = await this.depotRepository.findOne({
      where: { id: id },
    });
    if (!Depot) throw new NotFoundException('اطلاعات انبار پیدا نشد');

    await this.depotRepository.delete(id);
  }

  async setDepotIsAccepted(id: number, user: User): Promise<Depot> {
    const depot = await this.depotRepository.findOne({
      where: { id: id },
    });
    if (!depot) throw new NotFoundException('اطلاعات انبار پیدا نشد');

    return await this.depotRepository.save({
      ...depot,
      isAccepted: true,
      acceptedBy: user,
    });
  }
}
