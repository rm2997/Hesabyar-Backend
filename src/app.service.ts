import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'به سیستم حسابیار خوش آمدید - لطفا ابتدا لاگین کنید';
  }
}
