import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UserAuthModule } from '../user-auth/user-auth.module';

@Module({
  imports: [UserAuthModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
