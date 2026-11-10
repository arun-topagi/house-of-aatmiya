import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!admin || admin.isBlocked) {
      throw new UnauthorizedException('Invalid admin email or password');
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid admin email or password');
    }

    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'house_of_aatmiya_jwt_secret_2026';

    const accessToken = this.jwtService.sign(
      {
        sub: admin.id,
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
      { secret, expiresIn: '7d' },
    );

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name || 'Snehal',
        role: admin.role,
        phone: admin.phone || '',
      },
    };
  }
}
