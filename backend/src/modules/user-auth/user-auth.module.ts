import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserAuthController } from './user-auth.controller';
import { UserAuthService } from './user-auth.service';
import { OptionalUserJwtGuard, UserJwtGuard } from './guards/user-jwt.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UserAuthController],
  providers: [UserAuthService, UserJwtGuard, OptionalUserJwtGuard],
  exports: [UserAuthService, UserJwtGuard, OptionalUserJwtGuard, JwtModule],
})
export class UserAuthModule {}
