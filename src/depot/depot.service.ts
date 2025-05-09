import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Depot } from './depot.entity';

@Injectable()
export class DepotService {
  constructor(
    @InjectRepository(Depot)
    private readonly depotRepository: Repository<Depot>,
  ) {}

  async createDepot(data: Partial<Depot>, user: number): Promise<Depot> {
    const Depot = this.depotRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: { id: user },
    });
    const saved = await this.depotRepository.save(Depot);
    return saved;
  }

  async getAllDepots(): Promise<Depot[]> {
    return await this.depotRepository.find();
  }

  async getDepotById(id: number): Promise<Depot | null> {
    const Depot = await this.depotRepository.findOne({ where: { id } });
    if (!Depot) throw new NotFoundException();

    return Depot;
  }

  async updateDepot(id: number, data: Partial<Depot>): Promise<Depot | null> {
    const Depot = await this.depotRepository.findOne({
      where: { id: id },
    });
    if (!Depot) throw new NotFoundException();
    Depot.depotName = data?.depotName!;
    Depot.depotUnit = data?.depotUnit!;
    Depot.depotInfo = data?.depotInfo!;
    console.log(Depot);

    return this.depotRepository.save(Depot);
  }

  async deleteDepot(id: number): Promise<void> {
    const Depot = await this.depotRepository.findOne({
      where: { id: id },
    });
    if (!Depot) throw new NotFoundException();

    await this.depotRepository.delete(id);
  }
}
