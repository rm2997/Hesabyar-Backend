import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  Req,
  UseGuards,
  Query,
  Patch,
  NotFoundException,
  Res,
  UploadedFile,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice.entity';
import { Request, Response } from 'express';
import { User } from 'src/users/users.entity';
import { Public } from 'src/common/decorators/jwt.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { PaymentTypes } from 'src/common/decorators/payment.enum';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async create(@Body() data: Partial<Invoice>, @Req() req: Request) {
    const user = req.user as User;
    console.log('Invoice data:', JSON.stringify(data));

    return await this.invoiceService.createInvoice(data, user);
  }

  @Get()
  async getAll() {
    return await this.invoiceService.getAllInvoices();
  }

  @Post('generateNewToken/:id')
  async generateNewToken(@Param('id') id: number) {
    return this.invoiceService.renewInvoiceToken(id);
  }

  @Patch('accept/:id')
  async setProformaIsAccepted(@Param('id') id: number, @Req() req: Request) {
    const acceptedBy = req.user as User;
    return await this.invoiceService.setInvoiceIsAccepted(id, acceptedBy);
  }

  @Patch('sent/:id')
  async setInvoiceIsSent(@Param('id') id: number) {
    return await this.invoiceService.setInvoiceIsSent(id);
  }

  @Get('file/:id')
  async getProformaApprovedFile(@Param('id') id: number, @Res() res: Response) {
    const invoice = await this.invoiceService.getInvoice(id);
    if (!invoice) throw new NotFoundException('اطلاعات مورد نظر وجود ندارد');
    if (!invoice?.approvedFile)
      throw new NotFoundException(
        'برای این پیش‌فاکتور فایل تاییدیه ثبت نشده است',
      );

    const filePath = join(__dirname, '..', '..', invoice.approvedFile);

    if (!existsSync(filePath)) {
      throw new NotFoundException('فایل در سرور موجود نیست');
    }

    res.setHeader('Content-Type', 'image/jpeg');
    return res.sendFile(filePath);
  }

  @Get('token/:token')
  @Public()
  async viewInvoice(@Param('token') token: string) {
    console.log(token);

    return await this.invoiceService.verifyAndFetchInvoice(token);
  }

  @Patch('token/:token')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/invoice',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            'invoice_' + Date.now() + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @Public()
  async updateInvoiceByToken(
    @Param('token') token: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException('فایلی ارسال نشده است');
    }
    const invoice = await this.invoiceService.verifyAndFetchInvoice(token);
    if (!invoice) throw new NotFoundException('اطلاعات مورد نظر وجود ندارد');

    const filePath = `/uploads/invoice/${image.filename}`;
    invoice.approvedFile = filePath;

    return this.invoiceService.updateInvoice(
      invoice?.id,
      invoice,
      invoice.createdBy,
    );
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    return await this.invoiceService.getInvoice(id);
  }

  @Get('user/my')
  async getUserInvoices(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.invoiceService.getUserInvoices(page, limit, search, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<Invoice>,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return await this.invoiceService.updateInvoice(id, data, user);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.invoiceService.deleteInvoice(id);
  }

  @Get('share-link/:id')
  async getShareableLink(@Param('id') id: number) {
    return {
      link: await this.invoiceService.generateShareableLink(id),
    };
  }
}
