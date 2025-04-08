// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// /**
//  * JwtAuthGuard از استراتژی 'jwt' برای احراز هویت استفاده می‌کند.
//  * این گارد بررسی می‌کند که آیا توکن JWT معتبر هست یا نه.
//  */
// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    return super.canActivate(context); // انجام عملیات احراز هویت برای مسیرهای غیر عمومی
  }
}
