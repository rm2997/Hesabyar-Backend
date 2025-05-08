import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Good } from './good.entity';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(Good)
    private readonly GoodRepository: Repository<Good>,
  ) {}

  async createGood(data: Partial<Good>, user: number): Promise<Good> {
    const Good = this.GoodRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: { id: user },
    });
    const saved = await this.GoodRepository.save(Good);
    return saved;
  }

  async getAllGoods(): Promise<Good[]> {
    return await this.GoodRepository.find();
  }

  async getGoodById(id: number): Promise<Good | null> {
    const Good = await this.GoodRepository.findOne({ where: { id } });
    if (!Good) throw new NotFoundException();

    return Good;
  }

  async updateGood(id: number, data: Partial<Good>): Promise<Good | null> {
    const Good = await this.GoodRepository.findOne({
      where: { id: id },
    });
    if (!Good) throw new NotFoundException();
    Good.goodName = data?.goodName!;
    Good.goodUnit = data?.goodUnit!;
    Good.goodInfo = data?.goodInfo!;
    console.log(Good);

    return this.GoodRepository.save(Good);
  }

  async deleteGood(id: number): Promise<void> {
    const Good = await this.GoodRepository.findOne({
      where: { id: id },
    });
    if (!Good) throw new NotFoundException();

    await this.GoodRepository.delete(id);
  }
}
