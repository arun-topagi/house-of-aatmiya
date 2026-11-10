import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import {
  MobileConfirmAddressDto,
  RefreshTokenDto,
  SendOtpDto,
  UpsertAddressDto,
  VerifyOtpDto,
} from './dto/user-auth.dto';
import {
  AuthenticatedUserRequest,
  UserJwtGuard,
} from './guards/user-jwt.guard';

@Controller('user-auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.userAuthService.sendOtp(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.userAuthService.verifyOtp(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.userAuthService.refreshAccessToken(dto);
  }

  @Get('profile')
  @UseGuards(UserJwtGuard)
  async getProfile(@Req() req: { user: AuthenticatedUserRequest }) {
    return this.userAuthService.getProfile(req.user.userId);
  }

  @Put('address')
  @UseGuards(UserJwtGuard)
  async upsertAddress(
    @Req() req: { user: AuthenticatedUserRequest },
    @Body() dto: UpsertAddressDto,
  ) {
    return this.userAuthService.upsertAddress(req.user.userId, dto);
  }

  @Post('confirm-address-mobile')
  @HttpCode(HttpStatus.OK)
  async confirmAddressFromMobile(@Body() dto: MobileConfirmAddressDto) {
    return this.userAuthService.confirmAddressFromMobile(dto);
  }
}
