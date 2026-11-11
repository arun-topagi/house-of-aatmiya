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
  type: string;
}

@Injectable()
export class UserJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization token. Please verify your WhatsApp number via OTP.',
      );
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('Authorization token is empty');
    }

    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'house_of_aatmiya_jwt_secret_2026';

    try {
      const payload = this.jwtService.verify(token, { secret });
      req.user = {
        userId: payload.sub || payload.userId,
        phone: payload.phone,
        type: payload.type || 'USER',
      } satisfies AuthenticatedUserRequest;
      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired user token. Please verify WhatsApp OTP again.',
      );
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
    const authHeader: string | undefined = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return true;
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      req.user = null;
      return true;
    }

    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'house_of_aatmiya_jwt_secret_2026';

    try {
      const payload = this.jwtService.verify(token, { secret });
      req.user = {
        userId: payload.sub || payload.userId,
        phone: payload.phone,
        type: payload.type || 'USER',
      } satisfies AuthenticatedUserRequest;
    } catch {
      req.user = null;
    }
    return true;
  }
}
