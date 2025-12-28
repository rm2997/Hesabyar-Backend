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
import { NotificationService } from 'src/notification/notification.service';
import { UsersService } from 'src/users/users.service';
import { Notification } from 'src/notification/notification.entity';
import { CustomerPhone } from 'src/customer/customer-phone.entity';
import { PhoneTypes } from 'src/common/decorators/phoneTypes.enum';
import { GoodsService } from 'src/goods/goods.service';
import { MssqlService } from 'src/mssql/mssql.service';

@Injectable()
export class DepotService {
  constructor(
    @InjectRepository(Depot)
    private readonly depotRepository: Repository<Depot>,
    @InjectRepository(DepotGoods)
    private readonly depotGoodsRepository: Repository<DepotGoods>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(CustomerPhone)
    private readonly customerPhoneRepository: Repository<CustomerPhone>,
    private readonly dataSource: DataSource,
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
    private readonly goodsService: GoodsService,
    private readonly mssqlService: MssqlService,
  ) {}

  async createDepot(data: Partial<Depot>, user: User): Promise<Depot> {
    const depotGoods = [...data?.depotGoods!];
    if (!depotGoods)
      throw new BadRequestException('هیچ کالایی برای سند انبار تعیین نشده است');

    depotGoods.map((g) => {
      g.createdAt = new Date();
      g.createdBy = user;
    });
    const depot = this.depotRepository.create({
      ...data,
      createdAt: new Date(),
      createdBy: user,
    });

    let saved = await this.depotRepository.save(depot);

    if (saved.depotType == DepotTypes.out) {
      const token = await this.generateNewToken(saved.id);
      saved.customerToken = token;
      saved = await this.depotRepository.save(saved);
    }
    await this.sendNotifToAdmins(saved.depotType, user, saved.id);
    return saved;
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
      .leftJoinAndSelect('invoice.customer', 'invoiceCustomer')
      .leftJoinAndSelect('depot.depotGoods', 'depotGoods')
      .leftJoinAndSelect('depotGoods.good', 'good')
      .leftJoinAndSelect('good.goodUnit', 'unit')
      .leftJoinAndSelect('depotGoods.issuedBy', 'customer')
      .leftJoinAndSelect('depot.createdBy', 'user')
      .leftJoinAndSelect('depot.acceptedBy', 'accepted_user')
      .leftJoinAndSelect('depot.warehouseAcceptedBy', 'warehouse_user');

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
      .leftJoinAndSelect('depot.acceptedBy', 'accepted_user')
      .leftJoinAndSelect('depot.warehouseAcceptedBy', 'warehouse_user');

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
      // .andWhere('depot.warehouseAcceptedBy IS NOT NULL')
      // .andWhere('depot.driver IS NOT NULL')
      // .andWhere("depot.driver <> '' ")
      .leftJoinAndSelect('depot.depotInvoice', 'invoice')
      .leftJoinAndSelect('invoice.customer', 'invoiceCustomer')
      .leftJoinAndSelect('depot.depotGoods', 'depotGoods')
      .leftJoinAndSelect('depotGoods.good', 'good')
      .leftJoinAndSelect('good.goodUnit', 'unit')
      .leftJoinAndSelect('depotGoods.issuedBy', 'customer')
      .leftJoinAndSelect('depot.createdBy', 'user')
      .leftJoinAndSelect('depot.acceptedBy', 'accepted_user')
      .leftJoinAndSelect('depot.warehouseAcceptedBy', 'warehouse_user');

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
      // .andWhere('depot.warehouseAcceptedBy IS NOT NULL')
      .andWhere('depot.driver IS NOT NULL')
      .andWhere("depot.driver <> '' ")
      .leftJoinAndSelect('depot.depotInvoice', 'invoice')
      .leftJoinAndSelect('invoice.customer', 'invoiceCustomer')
      .leftJoinAndSelect('depot.depotGoods', 'depotGoods')
      .leftJoinAndSelect('depotGoods.good', 'good')
      .leftJoinAndSelect('good.goodUnit', 'unit')
      .leftJoinAndSelect('depotGoods.issuedBy', 'customer')
      .leftJoinAndSelect('depot.createdBy', 'user')
      .leftJoinAndSelect('depot.acceptedBy', 'accepted_user')
      .leftJoinAndSelect('depot.warehouseAcceptedBy', 'warehouse_user')
      .andWhere('invoice.approvedFile IS NOT NULL');

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
      .andWhere('depot.isAccepted=true')
      .andWhere('depot.warehouseAcceptedById IS NULL');
    // .andWhere('depot.driver IS NOT NULL')
    // .andWhere("depot.driver<>''")

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
      .andWhere('depot.isAccepted=true')
      .andWhere('depot.warehouseAcceptedById IS NULL')
      //.andWhere('depot.isSent=true')
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
      relations: ['depotGoods', 'depotGoods.good', 'depotInvoice'],
    });
    if (!depot) throw new NotFoundException('سند مورد نظر موجود نیست');

    return depot;
  }

  async getDepotByInvoiceId(invoiceId: number): Promise<Depot | null> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });
    if (!invoice)
      throw new BadRequestException('شماره فاکتور درج شده برای سند اشتباه است');

    const depot = await this.depotRepository.findOne({
      where: { depotInvoice: { id: invoice.id } },
      relations: ['depotGoods', 'depotGoods.good', 'depotInvoice'],
    });

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
      relations: ['depotGoods', 'warehouseAcceptedBy', 'acceptedBy'],
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

  async updateDepotByPublicCustomer(depot: Depot) {
    const saved = await this.updateDepot(depot.id, depot);

    const admins: User[] = await this.usersService.getAdminUsers();
    if (!admins || admins?.length == 0) return saved;
    admins.forEach(async (user) => {
      const notif = new Notification();
      notif.fromUser = depot.createdBy;
      notif.toUser = user;
      notif.message = ` همکار گرامی لطفا جهت تایید سند خروج کالا شماره ${depot.id} اقدام فرمایید`;
      notif.title = ` تایید سند خروج کالا شماره ${depot.id}`;
      await this.notificationService.createNotification(notif, depot.createdBy);
    });
    return saved;
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

  async setInputDepotIsAccepted(
    inputDepot: Depot,
    user: User,
  ): Promise<Depot | any> {
    inputDepot.isAccepted = true;
    inputDepot.acceptedBy = user;
    const saved = await this.depotRepository.save(inputDepot);
    await this.sendNotifToWarehouseMen(saved.depotType, user, saved.id);
    return saved;
  }

  async setOutputtDepotIsAccepted(
    outputDepot: Depot,
    user: User,
  ): Promise<Depot | any> {
    outputDepot.isAccepted = true;
    outputDepot.acceptedBy = user;
    const saved = await this.depotRepository.save(outputDepot);
    await this.sendNotifToWarehouseMen(saved.depotType, user, saved.id);
    return saved;
  }

  async sendNotifToWarehouseMen(
    docType: DepotTypes,
    sender: User,
    docId: Number,
  ) {
    const warehouseMen: User[] = await this.usersService.getAdminUsers();
    if (!warehouseMen || warehouseMen?.length == 0) return;
    warehouseMen.forEach(async (user) => {
      const notif = new Notification();
      notif.fromUser = sender;
      notif.toUser = user;
      let msg = 'همکار گرامی لطفا جهت تایید سند ';
      let msgSubject = 'تایید سند';
      if (docType == DepotTypes.in) {
        msg += ' ' + 'ورودی';
        msgSubject += ' ' + 'ورودی';
      } else {
        msg += ' ' + 'خروجی';
        msgSubject += ' ' + 'خروجی';
      }
      msg += ' انبار به شماره ' + docId + ' اقدام فرمایید ';
      msgSubject += ' انبار به شماره ' + docId;
      notif.message = msg;
      notif.title = msgSubject;
      await this.notificationService.createNotification(notif, sender);
    });
  }

  async sendNotifToAdmins(docType: DepotTypes, sender: User, docId: Number) {
    const admins: User[] = await this.usersService.getAdminUsers();
    if (!admins || admins?.length == 0) return;
    admins.forEach(async (user) => {
      const notif = new Notification();
      notif.fromUser = user;
      notif.toUser = user;
      let msg = 'همکار گرامی لطفا جهت تایید سند ';
      let msgSubject = 'تایید سند';
      if (docType == DepotTypes.in) {
        msg += ' ' + 'ورودی';
        msgSubject += ' ' + 'ورودی';
      } else {
        msg += ' ' + 'خروجی';
        msgSubject += ' ' + 'خروجی';
      }
      msg += ' شماره ' + docId + ' اقدام فرمایید ';
      msgSubject += ' شماره ' + docId;
      notif.message = msg;

      notif.title = msgSubject;
      await this.notificationService.createNotification(notif, user);
    });
  }

  async setInputDepotIsAcceptedByWarehouse(
    inputDepot: Depot,
    user: User,
  ): Promise<Depot | any> {
    const depot = await this.dataSource.transaction(async (manager) => {
      for (const depotGood of inputDepot.depotGoods) {
        const good = depotGood.good as Good;
        const qty = depotGood.quantity;
        if (!good) {
          throw new NotFoundException(
            `کالای مربوط به رکورد ${depotGood.id} یافت نشد`,
          );
        }
        good.goodCount += qty;
        await manager.save(Good, good);
      }
      console.log('depot will accept by:', user);
      inputDepot.warehouseAcceptedBy = user;
      inputDepot.warehouseAcceptedAt = new Date();
      inputDepot.finished = true;
      const saved = await manager.save(Depot, inputDepot);
      return saved;
    });

    return depot;
  }

  async setDepotExitIsAcceptedByWarehouse(
    outputDepot: Depot,
    user: User,
  ): Promise<Depot | any> {
    try {
      const depot = await this.dataSource.transaction(async (manager) => {
        for (const depotGood of outputDepot.depotGoods) {
          const good = depotGood.good as Good;
          const goodQuantity = await this.goodsService.getGoodById(good.id);
          const qty = depotGood.quantity;
          if (!good || !goodQuantity) {
            throw new NotFoundException(
              `کالای مربوط به رکورد ${depotGood.id} وجود ندارد`,
            );
          }

          if (goodQuantity.goodCount < qty) {
            throw new BadRequestException(
              `موجودی کافی برای کالای "${good.goodName}" وجود ندارد`,
            );
          }
          //good.goodCount -= qty;
          //await manager.save(Good, good);
        }

        console.log('depot will accept by warehouse user:', user);
        const invoice = depot?.depotInvoice!;
        invoice.finished = true;
        await manager.save(Invoice, invoice);
        outputDepot.warehouseAcceptedBy = user;
        outputDepot.warehouseAcceptedAt = new Date();
        outputDepot.finished = true;
        const sepidarInventoryDelivery =
          await this.mssqlService.createIncentoryDelivery(depot);
        if (!sepidarInventoryDelivery)
          throw new BadRequestException('خطا در درج در سپیدار');
        outputDepot.sepidarId =
          sepidarInventoryDelivery.InventoryDeliveryID + '';
        outputDepot.depotNumber = sepidarInventoryDelivery.Number;

        return await manager.save(Depot, outputDepot);
      });

      const mobileNumber = await this.customerPhoneRepository.findOne({
        where: {
          phoneType: PhoneTypes.mobile,
          isPrimary: true,
          customer: { id: depot?.depotInvoice.customer.id },
        },
      });
      const token = await this.generateNewToken(depot?.id);
      if (mobileNumber) {
        const sms = await this.sendSmsForDepotExit(
          mobileNumber?.phoneNumber!,
          depot?.depotInvoice?.id,
          depot?.driver,
          token,
        );
        console.log('SMS status:', sms);
      }

      return depot;
    } catch (error) {
      throw new BadRequestException(error.manager);
    }
  }

  async setDepotIsSent(id: number) {
    const depot = await this.depotRepository.findOne({
      where: { id },
      relations: ['depotInvoice'],
    });
    if (depot) {
      if (!depot.customerToken)
        depot.customerToken = await this.generateNewToken(depot.id);
      const mobileNumber = await this.customerPhoneRepository.findOne({
        where: {
          phoneType: PhoneTypes.mobile,
          isPrimary: true,
          customer: { id: depot.depotInvoice.customer.id },
        },
      });
      const smsResult = await this.smsService.sendUpdateDepotSms(
        depot.depotInvoice.customer,
        mobileNumber?.phoneNumber!,
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

  async sendSmsForDepotExit(
    driverMobile: string,
    depotId: number,
    driverInfo: string,
    token: string,
  ) {
    //const token = await this.generateNewToken(depotId);
    await this.smsService.sendDepotExitSms(
      driverMobile,
      depotId,
      driverInfo,
      token,
    );
  }
}
