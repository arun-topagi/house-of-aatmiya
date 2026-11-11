import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  MobileConfirmAddressDto,
  RefreshTokenDto,
  SendOtpDto,
  UpdateUserProfileDto,
  UpsertAddressDto,
  VerifyOtpDto,
} from './dto/user-auth.dto';
import { randomBytes } from 'crypto';

const NEVER_EXPIRING_DATE = new Date('2099-12-31T23:59:59.000Z');

@Injectable()
export class UserAuthService {
  private readonly logger = new Logger(UserAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  private async deliverWhatsAppOtp(
    phone: string,
    otpCode: string,
  ): Promise<{ deliveredViaMeta: boolean }> {
    const phoneId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
    const templateName =
      this.configService.get<string>('WHATSAPP_OTP_TEMPLATE_NAME') ||
      'otp_authentication';

    if (!phoneId || !accessToken) {
      this.logger.log(
        `[WhatsApp Dev Mode] OTP for +91-${phone} is ${otpCode}`,
      );
      return { deliveredViaMeta: false };
    }

    const recipient = `91${phone}`;
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: otpCode }],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [{ type: 'text', text: otpCode }],
          },
        ],
      },
    };

    try {
      let response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data = await response.json();

      // If button component failed, retry without button component (matches Raitha-Bandhu)
      if (!response.ok && data?.error?.message?.includes('component')) {
        this.logger.warn(
          'Retrying WhatsApp OTP template payload without button component...',
        );
        const retryPayload = {
          messaging_product: 'whatsapp',
          to: recipient,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en_US' },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: otpCode }],
              },
            ],
          },
        };

        response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(retryPayload),
        });
        data = await response.json();
      }

      if (!response.ok) {
        const errorDetail =
          data?.error?.message || `HTTP ${response.status}`;
        this.logger.warn(
          `WhatsApp Cloud API returned (${errorDetail}); falling back to dev OTP log`,
        );
        return { deliveredViaMeta: false };
      }

      this.logger.log(`WhatsApp OTP delivered successfully to ${recipient}`);
      return { deliveredViaMeta: true };
    } catch (err: any) {
      this.logger.warn(`WhatsApp Cloud API error: ${err.message}`);
      return { deliveredViaMeta: false };
    }
  }

  async sendOtp(dto: SendOtpDto) {
    const phone = this.normalizePhone(dto.phone);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      throw new BadRequestException(
        'Please enter a valid 10-digit Indian WhatsApp mobile number.',
      );
    }

    const otpCode = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const delivery = await this.deliverWhatsAppOtp(phone, otpCode);

    await this.prisma.otp_codes.create({
      data: {
        phone_number: phone,
        code: otpCode,
        expires_at: expiresAt,
        is_used: false,
      },
    });

    const devMode =
      this.configService.get<string>('WHATSAPP_OTP_DEV_MODE') !== 'false';

    return {
      message: delivery.deliveredViaMeta
        ? `4-digit OTP sent to your WhatsApp (+91 ${phone})`
        : `WhatsApp OTP generated for +91 ${phone} (Dev OTP: ${otpCode})`,
      phone,
      expiresInSeconds: 300,
      ...(devMode && !delivery.deliveredViaMeta ? { devOtp: otpCode } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const phone = this.normalizePhone(dto.phone);
    const otp = dto.otp.trim();

    const latestOtp = await this.prisma.otp_codes.findFirst({
      where: {
        phone_number: phone,
        is_used: false,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!latestOtp || latestOtp.code !== otp) {
      throw new BadRequestException('Invalid or expired WhatsApp OTP.');
    }

    await this.prisma.otp_codes.update({
      where: { id: latestOtp.id },
      data: { is_used: true },
    });

    const existingUser = await this.prisma.users.findUnique({
      where: { phone },
      include: {
        addresses: {
          orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
          take: 1,
        },
      },
    });

    let user;
    if (existingUser) {
      user = await this.prisma.users.update({
        where: { id: existingUser.id },
        data: {
          is_phone_verified: true,
          ...(dto.name ? { name: dto.name.trim() } : {}),
          updated_at: new Date(),
        },
        include: {
          addresses: {
            orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
            take: 1,
          },
        },
      });
    } else {
      user = await this.prisma.users.create({
        data: {
          phone,
          name: dto.name?.trim() || 'Aatmiya Guest',
          is_phone_verified: true,
          opt_in_marketing: true,
        },
        include: {
          addresses: true,
        },
      });
    }

    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'house_of_aatmiya_jwt_secret_2026';

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        userId: user.id,
        phone: user.phone,
        type: 'USER',
      },
      { secret, expiresIn: '30d' },
    );

    const existingSession = await this.prisma.sessions.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
    });

    let refreshToken: string;
    if (existingSession) {
      refreshToken = existingSession.refresh_token;
      await this.prisma.sessions.update({
        where: { id: existingSession.id },
        data: { expires_at: NEVER_EXPIRING_DATE },
      });
    } else {
      refreshToken = randomBytes(32).toString('hex');
      await this.prisma.sessions.create({
        data: {
          user_id: user.id,
          refresh_token: refreshToken,
          expires_at: NEVER_EXPIRING_DATE,
        },
      });
    }

    const defaultAddress = user.addresses?.[0] || null;

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name || '',
        isPhoneVerified: true,
      },
      address: defaultAddress ? this.formatAddress(defaultAddress) : null,
    };
  }

  async refreshAccessToken(dto: RefreshTokenDto) {
    const session = await this.prisma.sessions.findFirst({
      where: { refresh_token: dto.refreshToken.trim() },
      include: { users: true },
    });

    if (!session || !session.users) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'house_of_aatmiya_jwt_secret_2026';

    const accessToken = this.jwtService.sign(
      {
        sub: session.users.id,
        userId: session.users.id,
        phone: session.users.phone,
        type: 'USER',
      },
      { secret, expiresIn: '30d' },
    );

    return {
      accessToken,
      refreshToken: session.refresh_token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Customer profile not found');
    }

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name || '',
        isPhoneVerified: Boolean(user.is_phone_verified),
        optInMarketing: Boolean(user.opt_in_marketing),
      },
      address: user.addresses[0]
        ? this.formatAddress(user.addresses[0])
        : null,
    };
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto) {
    const existing = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new NotFoundException('Customer profile not found');
    }

    const updated = await this.prisma.users.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.optInMarketing !== undefined
          ? { opt_in_marketing: dto.optInMarketing }
          : {}),
        updated_at: new Date(),
      },
    });

    return {
      id: updated.id,
      phone: updated.phone,
      name: updated.name || '',
      isPhoneVerified: Boolean(updated.is_phone_verified),
      optInMarketing: Boolean(updated.opt_in_marketing),
    };
  }

  async upsertAddress(userId: string, dto: UpsertAddressDto) {
    if (dto.name?.trim()) {
      await this.prisma.users.update({
        where: { id: userId },
        data: { name: dto.name.trim(), updated_at: new Date() },
      });
    }

    const existingAddress = await this.prisma.addresses.findFirst({
      where: { user_id: userId },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });

    const mapsUrl =
      dto.googleMapsUrl ||
      (dto.latitude !== undefined && dto.longitude !== undefined
        ? `https://maps.google.com/?q=${dto.latitude},${dto.longitude}`
        : existingAddress?.google_maps_url || null);

    let saved;
    if (existingAddress) {
      saved = await this.prisma.addresses.update({
        where: { id: existingAddress.id },
        data: {
          flat_or_house: dto.flatOrHouse.trim(),
          area_or_society: dto.areaOrSociety.trim(),
          city: dto.city.trim(),
          state: dto.state?.trim() || 'Maharashtra',
          pincode: dto.pincode.trim(),
          landmark: dto.landmark?.trim() || '',
          is_society_resident: Boolean(dto.isSocietyResident),
          ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
          ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
          google_maps_url: mapsUrl,
          is_mobile_confirmed:
            dto.isMobileConfirmed !== undefined
              ? dto.isMobileConfirmed
              : Boolean(dto.latitude && dto.longitude),
          is_default: true,
          updated_at: new Date(),
        },
      });
    } else {
      saved = await this.prisma.addresses.create({
        data: {
          user_id: userId,
          flat_or_house: dto.flatOrHouse.trim(),
          area_or_society: dto.areaOrSociety.trim(),
          city: dto.city.trim(),
          state: dto.state?.trim() || 'Maharashtra',
          pincode: dto.pincode.trim(),
          landmark: dto.landmark?.trim() || '',
          is_society_resident: Boolean(dto.isSocietyResident),
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
          google_maps_url: mapsUrl,
          is_mobile_confirmed:
            dto.isMobileConfirmed !== undefined
              ? dto.isMobileConfirmed
              : Boolean(dto.latitude && dto.longitude),
          is_default: true,
        },
      });
    }

    return this.formatAddress(saved);
  }

  async confirmAddressFromMobile(
    dto: MobileConfirmAddressDto,
    authenticatedUserId?: string,
  ) {
    const phone = this.normalizePhone(dto.phone);
    const user = authenticatedUserId
      ? await this.prisma.users.findUnique({
          where: { id: authenticatedUserId },
        })
      : await this.prisma.users.findUnique({
          where: { phone },
        });

    if (!user) {
      throw new NotFoundException(
        'Phone number not found. Please verify your WhatsApp OTP first.',
      );
    }

    return this.upsertAddress(user.id, {
      flatOrHouse: dto.flatOrHouse,
      areaOrSociety: dto.areaOrSociety,
      city: dto.city,
      pincode: dto.pincode,
      landmark: dto.landmark,
      isSocietyResident: dto.isSocietyResident,
      latitude: dto.latitude,
      longitude: dto.longitude,
      googleMapsUrl: `https://maps.google.com/?q=${dto.latitude},${dto.longitude}`,
      isMobileConfirmed: true,
    });
  }

  private formatAddress(addr: any) {
    return {
      id: addr.id,
      flatOrHouse: addr.flat_or_house,
      areaOrSociety: addr.area_or_society,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark || '',
      isSocietyResident: Boolean(addr.is_society_resident),
      latitude: addr.latitude !== null ? Number(addr.latitude) : null,
      longitude: addr.longitude !== null ? Number(addr.longitude) : null,
      googleMapsUrl: addr.google_maps_url || '',
      isMobileConfirmed: Boolean(addr.is_mobile_confirmed),
      isDefault: Boolean(addr.is_default),
    };
  }
}
