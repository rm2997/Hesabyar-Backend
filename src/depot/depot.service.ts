import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Depot } from './depot.entity';
import { DepotTypes } from 'src/common/decorators/depotTypes.enum';

@Injectable()
export class DepotService {
  constructor(
    @InjectRepository(Depot)
    private readonly depotRepository: Repository<Depot>,
    private readonly dataSource: DataSource,
  ) {}

  async createDepot(data: Partial<Depot>, user: number): Promise<Depot> {
    const depot = this.depotRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: { id: user },
    });

    const saved = await this.depotRepository.save(depot);
    return saved;
  }

  async getAllInputDepots(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Depot[] }> {
    const query = this.dataSource
      .getRepository(Depot)
      .createQueryBuilder('depot')
      .where('depot.depotType= :type', { type: DepotTypes.in })
      .leftJoinAndSelect('depot.depotGood', 'good')
      .leftJoinAndSelect('depot.createdBy', 'user')
      .leftJoinAndSelect('depot.deliveredBy', 'customer');

    if (search) {
      query.andWhere(`depot.id=${search}`);
    }

    const total = await query.getCount();

    const items = await query
      .skip(limit == -1 ? 0 : (page - 1) * limit)
      .take(limit == -1 ? undefined : limit)
      .orderBy('depot.deliveredAt', 'DESC')
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
      .leftJoinAndSelect('depot.depotGood', 'good');

    if (search) {
      query.andWhere('depot.id= :search', { search: `%${search}%` });
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
    const Depot = await this.depotRepository.findOne({
      where: { id },
      relations: ['depotGood'],
    });
    if (!Depot) throw new NotFoundException();

    return Depot;
  }

  async updateDepot(id: number, data: Partial<Depot>): Promise<Depot | null> {
    const depot = await this.depotRepository.findOne({
      where: { id: id },
    });
    if (!depot) throw new NotFoundException('اطلاعات انبار وجود ندارد');

    return await this.depotRepository.save({ ...depot, ...data });
  }

  async deleteDepot(id: number): Promise<void> {
    const Depot = await this.depotRepository.findOne({
      where: { id: id },
    });
    if (!Depot) throw new NotFoundException('اطلاعات انبار پیدا نشد');

    await this.depotRepository.delete(id);
  }
}
