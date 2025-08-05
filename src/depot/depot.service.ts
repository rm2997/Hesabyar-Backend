import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Depot } from './depot.entity';
import { DepotTypes } from 'src/common/decorators/depotTypes.enum';
import { DepotGoods } from './depot-goods.entity';
import { User } from 'src/users/users.entity';
import { Good } from 'src/goods/good.entity';
import { SmsService } from 'src/sms/sms.service';
import { Invoice } from 'src/invoice/invoice.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DepotService {
  constructor(
    @InjectRepository(Depot)
    private readonly depotRepository: Repository<Depot>,
    @InjectRepository(DepotGoods)
    private readonly depotGoodsRepository: Repository<DepotGoods>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly dataSource: DataSource,
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
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
    const token = await this.generateNewToken(saved.id);
    saved.customerToken = token;
    return await this.depotRepository.save(saved);
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
      .leftJoinAndSelect('depot.createdBy', 'user')
      .leftJoinAndSelect('depot.acceptedBy', 'accepted_user');

    if (search) {
      query.andWhere(`depot.id=${search}`);
    }

    const total = await query.getCount();

    const items = await query
      .skip(limit == -1 ? 0 : (page - 1) * limit)
      .take(limit == -1 ? undefined : limit)
      .orderBy('depot.id', 'DESC')
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
      .leftJoinAndSelect('invoice.customer', 'invoiceCustomer')
      .leftJoinAndSelect('depot.depotGoods', 'depotGoods')
      .leftJoinAndSelect('depotGoods.good', 'good')
      .leftJoinAndSelect('good.goodUnit', 'unit')
      .leftJoinAndSelect('depotGoods.issuedBy', 'customer')
      .leftJoinAndSelect('depot.createdBy', 'user')
      .leftJoinAndSelect('depot.acceptedBy', 'accepted_user');

    if (search) {
      query.andWhere(`depot.id=${search}`);
    }

    const total = await query.getCount();

    const items = await query
      .skip(limit == -1 ? 0 : (page - 1) * limit)
      .take(limit == -1 ? undefined : limit)
      .orderBy('depot.id', 'DESC')
      .getMany();

    return { items, total };
  }

  async getAllOutputDepotsForAccept(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Depot[] }> {
    const query = this.dataSource
      .getRepository(Depot)
      .createQueryBuilder('depot')
      .where('depot.depotType= :type', { type: DepotTypes.out })
      .andWhere('depot.isAccepted=0')
      .andWhere('depot.driver IS NOT NULL')
      .andWhere("depot.driver <> '' ")
      .leftJoinAndSelect('depot.depotInvoice', 'invoice')
      .leftJoinAndSelect('invoice.customer', 'invoiceCustomer')
      .leftJoinAndSelect('depot.depotGoods', 'depotGoods')
      .leftJoinAndSelect('depotGoods.good', 'good')
      .leftJoinAndSelect('good.goodUnit', 'unit')
      .leftJoinAndSelect('depotGoods.issuedBy', 'customer')
      .leftJoinAndSelect('depot.createdBy', 'user')
      .leftJoinAndSelect('depot.acceptedBy', 'accepted_user');

    if (search) {
      query.andWhere(`depot.id=${search}`);
    }

    const total = await query.getCount();

    const items = await query
      .skip(limit == -1 ? 0 : (page - 1) * limit)
      .take(limit == -1 ? undefined : limit)
      .orderBy('depot.id', 'DESC')
      .getMany();

    return { items, total };
  }

  async getAllInputDepotsForWareHouseAccept(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Depot[] }> {
    const query = this.dataSource
      .getRepository(Depot)
      .createQueryBuilder('depot')
      .leftJoinAndSelect('depot.depotInvoice', 'invoice')
      .leftJoinAndSelect('invoice.customer', 'invoiceCustomer')
      .leftJoinAndSelect('depot.depotGoods', 'depotGoods')
      .leftJoinAndSelect('depotGoods.good', 'good')
      .leftJoinAndSelect('good.goodUnit', 'unit')
      .leftJoinAndSelect('depotGoods.issuedBy', 'customer')
      .leftJoinAndSelect('depot.createdBy', 'user')
      .leftJoinAndSelect('depot.acceptedBy', 'accepted_user')
      .where('depot.depotType= :type', { type: DepotTypes.in })
      .andWhere('depot.isSent=true')
      .andWhere('depot.isAccepted=true')
      .andWhere('depot.driver IS NOT NULL')
      .andWhere("depot.driver<>''");

    if (search) {
      query.andWhere(`depot.id=${search}`);
    }

    const total = await query.getCount();

    const items = await query
      .skip(limit == -1 ? 0 : (page - 1) * limit)
      .take(limit == -1 ? undefined : limit)
      .orderBy('depot.id', 'DESC')
      .getMany();

    return { items, total };
  }

  async getAllInputDepotsForAccept(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Depot[] }> {
    const query = this.dataSource
      .getRepository(Depot)
      .createQueryBuilder('depot')
      .where('depot.depotType= :type', { type: DepotTypes.in })
      .andWhere('depot.isAccepted=0')
      .leftJoinAndSelect('depot.depotInvoice', 'invoice')
      .leftJoinAndSelect('invoice.customer', 'invoiceCustomer')
      .leftJoinAndSelect('depot.depotGoods', 'depotGoods')
      .leftJoinAndSelect('depotGoods.good', 'good')
      .leftJoinAndSelect('good.goodUnit', 'unit')
      .leftJoinAndSelect('depotGoods.issuedBy', 'customer')
      .leftJoinAndSelect('depot.createdBy', 'user')
      .leftJoinAndSelect('depot.acceptedBy', 'accepted_user');

    if (search) {
      query.andWhere(`depot.id=${search}`);
    }

    const total = await query.getCount();

    const items = await query
      .skip(limit == -1 ? 0 : (page - 1) * limit)
      .take(limit == -1 ? undefined : limit)
      .orderBy('depot.id', 'DESC')
      .getMany();

    return { items, total };
  }

  async getAllOutputDepotsForWareHouseAccept(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ total: number; items: Depot[] }> {
    const query = this.dataSource
      .getRepository(Depot)
      .createQueryBuilder('depot')
      .leftJoinAndSelect('depot.depotInvoice', 'invoice')
      .leftJoinAndSelect('invoice.customer', 'invoiceCustomer')
      .leftJoinAndSelect('depot.depotGoods', 'depotGoods')
      .leftJoinAndSelect('depotGoods.good', 'good')
      .leftJoinAndSelect('good.goodUnit', 'unit')
      .leftJoinAndSelect('depotGoods.issuedBy', 'customer')
      .leftJoinAndSelect('depot.createdBy', 'user')
      .leftJoinAndSelect('depot.acceptedBy', 'accepted_user')
      .where('depot.depotType= :type', { type: DepotTypes.out })
      .andWhere('depot.isSent=true')
      .andWhere('depot.isAccepted=true')
      .andWhere('depot.driver IS NOT NULL')
      .andWhere("depot.driver<>''");

    if (search) {
      query.andWhere(`depot.id=${search}`);
    }

    const total = await query.getCount();

    const items = await query
      .skip(limit == -1 ? 0 : (page - 1) * limit)
      .take(limit == -1 ? undefined : limit)
      .orderBy('depot.id', 'DESC')
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

  async updateDepot(id: number, data: Partial<Depot>): Promise<Depot | null> {
    const depot = await this.depotRepository.findOne({
      where: { id: id },
      relations: ['depotGoods'],
    });
    if (!depot) throw new NotFoundException('اطلاعات انبار وجود ندارد');

    // if (data.isAccepted && !depot.acceptedBy) {
    //   // data.acceptedBy = user;
    //   // console.log('accepted user added....');
    //   await this.setDepotIsAccepted(depot.id, user);
    // }

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

  async setDepotIsAccepted(id: number, user: User): Promise<Depot | any> {
    const depot = await this.dataSource.transaction(async (manager) => {
      const depot = await manager.findOne(Depot, {
        where: { id: id },
        relations: ['depotGoods', 'depotGoods.good', 'depotInvoice'],
      });

      if (!depot) throw new NotFoundException('اطلاعات انبار پیدا نشد');

      if (depot.isAccepted)
        throw new BadRequestException('این سند قبلا تایید شده است');

      for (const depotGood of depot.depotGoods) {
        const good = depotGood.good as Good;
        const qty = depotGood.quantity;

        if (!good) {
          throw new NotFoundException(
            `کالای مربوط به رکورد ${depotGood.id} یافت نشد`,
          );
        }

        if (depot.depotType === DepotTypes.in) {
          good.goodCount += qty;
        } else if (depot.depotType === DepotTypes.out) {
          if (good.goodCount < qty) {
            throw new BadRequestException(
              `موجودی کافی برای کالای "${good.goodName}" وجود ندارد`,
            );
          }
          good.goodCount -= qty;
        }

        await manager.save(Good, good);
      }

      depot.isAccepted = true;
      console.log('depot will accept by:', user);

      depot.acceptedBy = user;
      if (depot.depotType == DepotTypes.out) {
        const invoice = depot?.depotInvoice!;
        invoice.finished = true;
        await manager.save(Invoice, invoice);
      }
      return await manager.save(Depot, depot);
      // return await this.depotRepository.save({
      //   ...depot,
      //   isAccepted: true,
      //   acceptedBy: user,
      // });
    });

    if (depot && depot?.depotType == DepotTypes.out) {
      const mobile = depot?.depotInvoice.customer?.customerMobile;
      if (mobile) {
        const sms = await this.sendSmsForDepotExit(
          mobile,
          depot?.depotInvoice?.id,
        );
        console.log('SMS status:', sms);
      }
    }
    return depot;
  }

  async setDepotIsSent(id: number) {
    const depot = await this.depotRepository.findOne({
      where: { id },
      relations: ['depotInvoice'],
    });
    if (depot) {
      if (!depot.customerToken)
        depot.customerToken = await this.generateNewToken(depot.id);
      const smsResult = await this.smsService.sendUpdateDepotSms(
        depot.depotInvoice.customer,
        depot.customerToken,
        depot.depotInvoice.id,
      );
      if (smsResult.status !== 1)
        throw new BadRequestException(
          'ارسال پیامک شکست خورد ' + smsResult.message,
        );
      return this.updateDepot(id, {
        customerToken: depot.customerToken,
        isSent: true,
      });
    }
    throw new NotFoundException('فاکتور وجود ندارد');
  }

  async generateNewToken(depotId: number): Promise<string> {
    const payload = { depotId };
    const secret = this.configService.get('DEPOT_LINK_SECRET');
    const expiresIn = this.configService.get<string>('DEPOT_LINK_EXPIRES_IN');

    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
  }

  async verifyAndFetchDepot(token: string): Promise<Depot> {
    try {
      const secret = this.configService.get('DEPOT_LINK_SECRET');
      const payload: any = jwt.verify(token, secret);
      const depot = await this.depotRepository.findOne({
        where: { id: payload.depotId },
        relations: ['createdBy', 'depotGoods', 'depotInvoice'],
      });
      console.log('Start fetching depot to show to customer:', payload);
      if (!depot) throw new NotFoundException('سند خروج پیدا نشد');
      return depot;
    } catch (err) {
      throw new BadRequestException('لینک نامعتبر یا منقضی‌شده است');
    }
  }

  async sendSmsForDepotExit(driverMobile: string, depotId: number) {
    //const token = await this.generateNewToken(depotId);
    await this.smsService.sendDepotExitSms(driverMobile, depotId);
  }
}
