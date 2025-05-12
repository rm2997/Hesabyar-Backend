import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './sale.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async createSale(data: Partial<Sale>, user: number): Promise<Sale> {
    const Sale = this.saleRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: { id: user },
    });
    const saved = await this.saleRepository.save(Sale);
    return saved;
  }

  async getAllSales(): Promise<Sale[]> {
    return await this.saleRepository.find();
  }

  async getSaleById(id: number): Promise<Sale | null> {
    const Sale = await this.saleRepository.findOne({ where: { id } });
    if (!Sale) throw new NotFoundException();

    return Sale;
  }

  async updateSale(id: number, data: Partial<Sale>): Promise<Sale | null> {
    const Sale = await this.saleRepository.findOne({
      where: { id: id },
    });
    if (!Sale) throw new NotFoundException();
    Sale.saleInfo = data?.saleInfo!;
    Sale.invoice = data?.invoice!;
    console.log(Sale);

    return this.saleRepository.save(Sale);
  }

  async deleteSale(id: number): Promise<void> {
    const Sale = await this.saleRepository.findOne({
      where: { id: id },
    });
    if (!Sale) throw new NotFoundException();

    await this.saleRepository.delete(id);
  }
}
