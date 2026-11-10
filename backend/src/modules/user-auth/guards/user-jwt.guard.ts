import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface AuthenticatedUserRequest {
  userId: string;
  phone: string;
}

@Injectable()
export class UserJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Please verify your WhatsApp number via OTP');
    }

    const token = authHeader.slice(7);
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'house_of_aatmiya_jwt_secret_2026';

    try {
      const payload = this.jwtService.verify(token, { secret });
      req.user = {
        userId: payload.userId || payload.sub,
        phone: payload.phone,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Session expired. Please verify WhatsApp OTP again.');
    }
  }
}

@Injectable()
export class OptionalUserJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return true;
    }

    const token = authHeader.slice(7);
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'house_of_aatmiya_jwt_secret_2026';

    try {
      const payload = this.jwtService.verify(token, { secret });
      req.user = {
        userId: payload.userId || payload.sub,
        phone: payload.phone,
      };
    } catch {
      req.user = null;
    }
    return true;
  }
}
