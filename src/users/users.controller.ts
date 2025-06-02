import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  UnauthorizedException,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRoles } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/common/decorators/roles.enum';
import { Request } from 'express';
import { Public } from 'src/common/decorators/jwt.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('seed-admin')
  @Public()
  async seedAdmin() {
    return this.usersService.createAdmin(); // بدون نیاز به احراز هویت
  }

  @Post()
  @UserRoles(Roles.Admin)
  async create(@Body() data: Partial<User>, @Req() req: Request) {
    const issuedUser = req.user as User;
    return this.usersService.createUser(data, issuedUser);
  }

  @Get()
  @UserRoles(Roles.Admin)
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string,
  ) {
    return this.usersService.findAll(page, limit, search);
  }

  @Put('changePass/:id')
  async changePass(
    @Param('id') id: number,
    @Body() data: { current: string; new: string },
    @Req() req: Request,
  ) {
    const user = req.user as User;
    if (user.role === Roles.Admin || user.id === id)
      return this.usersService.changePass(id, data, user);
    else
      throw new UnauthorizedException(
        'شما نمی توانید کلمه عبور سایر کاربران را تغییر دهید',
      );
  }

  @Put('location')
  async updateUserLocation(
    @Body() data: { location: string },
    @Req() req: Request,
  ): Promise<string | User> {
    const user = req.user as User;
    if (!data?.location)
      throw new BadRequestException('موقعیت مکانی صحیح نیست');
    return this.usersService.updateUserLocation(user, data.location);
  }

  @Post('sms/:id')
  async sendLocationSms(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: (err) => new BadRequestException(),
      }),
    )
    id: number,
  ) {
    return this.usersService.sendLocationSms(id);
  }

  @Get('view/:token')
  @Public()
  async viewUserFromToken(@Param('token') token: string) {
    return await this.usersService.verifyUserLocationToken(token);
  }

  @Get(':id')
  @UserRoles(Roles.Admin)
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: (err) => new BadRequestException(),
      }),
    )
    id: number,
    @Req() req: Request,
  ): Promise<User> {
    const user = req.user as any;
    const isOwner = user.id === +id;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'شما فقط می توانید اطلاعات خودتان را مشاهده کنید',
      );
    }
    return this.usersService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<User>,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const isOwner = user.id === +id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'شما فقط می‌توانید اطلاعات خودتان را ویرایش کنید.',
      );
    }

    return this.usersService.updateUser(id, data);
  }

  @Delete(':id')
  @UserRoles(Roles.Admin)
  async remove(@Param('id') id: number) {
    return this.usersService.deleteUser(id);
  }
}
