import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
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

  async getAllUnits(): Promise<Unit[]> {
    return await this.unitRepository.find();
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
