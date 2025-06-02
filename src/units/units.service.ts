import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Unit } from './unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    private readonly dataSource: DataSource,
  ) {}

  async createUnit(data: Partial<Unit>, user: number): Promise<Unit> {
    const Unit = this.unitRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: { id: user },
    });
    const saved = await this.unitRepository.save(Unit);
    return saved;
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
      query.andWhere('unit.unitName LIKE :search', { search: `%${search}%` });
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

    await this.unitRepository.delete(id);
  }
}
