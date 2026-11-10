import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Admin authentication required');
    }

    const token = authHeader.slice(7);
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'house_of_aatmiya_jwt_secret_2026';

    try {
      const payload = this.jwtService.verify(token, { secret });
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired Admin token');
    }
  }
}
