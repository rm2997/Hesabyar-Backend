import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { ProformaService } from '../proforma/proforma.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PaymentTypes } from 'src/common/decorators/payment.enum';
import { User } from 'src/users/users.entity';
import { InvoiceGoods } from './invoice-good.entity';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>,
    private readonly proformaService: ProformaService,
    @InjectRepository(InvoiceGoods)
    private invoiceGoodsRepository: Repository<InvoiceGoods>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
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

  async getAllInvoices(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Invoice[] }> {
    const query = this.dataSource
      .getRepository(Invoice)
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.createdBy', 'user')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .leftJoinAndSelect('invoice.invoiceGoods', 'invoiceGoods')
      .leftJoinAndSelect('invoiceGoods.good', 'good');

    if (search) {
      query.andWhere('invoice.id= :search', { search: search });
    }

    const total = await query.getCount();

    const items = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();

    return { items, total };
  }

  async getInvoice(id: number): Promise<Invoice | null> {
    return await this.invoiceRepository.findOne({ where: { id } });
  }

  async getUserInvoices(
    page: number,
    limit: number,
    search: string,
    userId: number,
  ): Promise<{ total: number; items: Invoice[] }> {
    const query = this.dataSource
      .getRepository(Invoice)
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.createdBy', 'user')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .leftJoinAndSelect('invoice.invoiceGoods', 'invoiceGoods')
      .leftJoinAndSelect('invoiceGoods.good', 'good')
      .andWhere('invoice.createdBy= :user', { user: userId });

    if (search) {
      query.andWhere('invoice.id= :search', { search: search });
    }

    const total = await query.getCount();

    const items = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();

    return { items, total };
  }

  async updateInvoice(
    id: number,
    data: Partial<Invoice>,
    updatedBy: User,
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['invoiceGoods'],
    });
    if (!invoice) throw new NotFoundException('فاکتور موجود نیست');
    invoice.totalAmount = data?.totalAmount!;
    data?.invoiceGoods?.map((g) => {
      if (g.id == 0) {
        g.createdAt = new Date();
        g.createdBy = updatedBy;
      } else {
        g.createdBy = updatedBy;
      }
    });
    await this.invoiceGoodsRepository.remove(invoice?.invoiceGoods!);
    invoice.invoiceGoods = [...data?.invoiceGoods!];
    return await this.invoiceRepository.save({ ...invoice, ...data });
  }

  async deleteInvoice(id: number): Promise<void> {
    await this.invoiceRepository.delete(id);
  }

  async generateShareableLink(invoiceId: number): Promise<string> {
    const payload = { sub: invoiceId };
    const secret = this.configService.get('INVOICE_LINK_SECRET');
    const expiresIn = this.configService.get<string>('INVOICE_LINK_EXPIRES_IN');

    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
  }

  async verifyAndFetchInvoice(token: string): Promise<Invoice> {
    try {
      const secret = this.configService.get('INVOICE_LINK_SECRET');
      const payload: any = jwt.verify(token, secret);
      const invoice = await this.invoiceRepository.findOne({
        where: { id: payload.invoiceId },
        relations: ['createdBy'],
      });

      if (!invoice) throw new NotFoundException('فاکتور پیدا نشد');
      return invoice;
    } catch (err) {
      throw new BadRequestException('لینک نامعتبر یا منقضی‌شده است');
    }
  }

  async setInvoiceIsAccepted(id: number, acceptedBy: User) {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (invoice) {
      return this.invoiceRepository.save({
        ...invoice,
        isAccepted: true,
        acceptedBy: acceptedBy,
      });
    }
    throw new NotFoundException('فاکتور وجود ندارد');
  }

  async setInvoiceIsSent(id: number) {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (invoice) {
      const smsResult = await this.smsService.sendUpdateInvoiceSms(
        invoice.customer,
        invoice.customerLink,
      );
      if (smsResult.status !== 1)
        throw new BadRequestException(
          'ارسال پیامک شکست خورد ' + smsResult.message,
        );
      return this.invoiceRepository.save({ ...invoice, isSent: true });
    }
    throw new NotFoundException('فاکتور وجود ندارد');
  }

  async renewInvoiceToken(invoiceId: number) {
    try {
      const invoice = await this.invoiceRepository.findOne({
        where: { id: invoiceId },
      });
      if (!invoice) throw new NotFoundException('پیش‌فاکتور وجود ندارد');

      const newToken = await this.generateShareableLink(invoiceId);
      invoice.customerLink = newToken;
      invoice.isSent = false;
      invoice.approvedFile = '';
      await this.invoiceRepository.save(invoice);
      return { message: 'توکن جدید صادر شد' };
    } catch (error) {}
  }
}
