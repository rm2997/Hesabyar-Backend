import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { ProformaService } from '../proforma/proforma.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PaymentTypes } from 'src/common/decorators/payment.enum';
import { User } from 'src/users/users.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
    private proformaService: ProformaService,
    private configService: ConfigService,
  ) {}

  async createInvoice(data: Partial<Invoice>, user: User): Promise<Invoice> {
    const proforma = await this.proformaService.getProforma(
      data?.proforma?.id!,
    );
    if (!proforma) {
      throw new Error('Proforma not found');
    }
    const invoiceGoods = [...data?.invoiceGoods!];

    invoiceGoods.map((item) => {
      item.createdBy = user;
    });
    const invoice = this.invoiceRepository.create({
      ...data,
      invoiceGoods: [...invoiceGoods],
      createdAt: Date(),
      createdBy: user,
      proforma: proforma,
    });

    const shareableLink = await this.generateShareableLink(invoice.id);
    invoice.customerLink = shareableLink;

    Logger.log(
      `Incomming invoice data is : ${invoice.invoiceGoods[0].quantity}`,
    );
    return await this.invoiceRepository.save(invoice);
  }

  async getAllInvoices(): Promise<Invoice[] | null> {
    return await this.invoiceRepository.find();
  }

  async getInvoice(id: number): Promise<Invoice | null> {
    return await this.invoiceRepository.findOne({ where: { id } });
  }

  async getUserInvoices(userId: number): Promise<Invoice[] | null> {
    return await this.invoiceRepository.find({
      where: { createdBy: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async updateInvoice(
    id: number,
    paymentStatus: PaymentTypes,
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (invoice) {
      invoice.paymentStatus = paymentStatus;
      return await this.invoiceRepository.save(invoice);
    }
    throw new Error('Invoice not found');
  }

  async deleteInvoice(id: number): Promise<void> {
    await this.invoiceRepository.delete(id);
  }

  async generateShareableLink(invoiceId: number): Promise<string> {
    const payload = { invoiceId };
    const secret = this.configService.get('INVOICE_LINK_SECRET');
    const expiresIn = this.configService.get('INVOICE_LINK_EXPIRES_IN');

    const token = jwt.sign(payload, secret, { expiresIn });
    const baseUrl = this.configService.get('APP_BASE_URL');

    return `${baseUrl}/invoice/view/${token}`;
  }

  async verifyAndFetchProforma(token: string): Promise<Invoice> {
    try {
      const secret = this.configService.get('INVOICE_LINK_SECRET');
      const payload: any = jwt.verify(token, secret);
      const proforma = await this.invoiceRepository.findOne({
        where: { id: payload.proformaId },
        relations: ['createdBy'],
      });

      if (!proforma) throw new NotFoundException('پیش‌فاکتور پیدا نشد');
      return proforma;
    } catch (err) {
      throw new UnauthorizedException('لینک نامعتبر یا منقضی‌شده است');
    }
  }
}
