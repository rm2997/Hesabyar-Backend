import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard از استراتژی 'jwt' برای احراز هویت استفاده می‌کند.
 * این گارد بررسی می‌کند که آیا توکن JWT معتبر هست یا نه.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
