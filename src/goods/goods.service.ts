import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Good } from './good.entity';
import { Unit } from 'src/units/unit.entity';
import { UnitsService } from 'src/units/units.service';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(Good)
    private readonly goodRepository: Repository<Good>,
    private readonly unitService: UnitsService,
  ) {}

  async createGood(data: Partial<Good>, user: number): Promise<Good> {
    const Good = this.goodRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: { id: user },
    });
    const saved = await this.goodRepository.save(Good);
    return saved;
  }

  async getAllGoods(): Promise<Good[]> {
    return await this.goodRepository.find();
  }

  async getGoodById(id: number): Promise<Good | null> {
    const Good = await this.goodRepository.findOne({ where: { id } });
    if (!Good) throw new NotFoundException();

    return Good;
  }

  async updateGood(id: number, data: Partial<Good>): Promise<Good | null> {
    const Good = await this.goodRepository.findOne({
      where: { id: id },
    });
    if (!Good) throw new NotFoundException();

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
