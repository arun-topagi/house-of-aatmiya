import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { ProductsModule } from './modules/products/products.module';
import { UserAuthModule } from './modules/user-auth/user-auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { AdminProductsModule } from './modules/admin-products/admin-products.module';
import { AdminOrdersModule } from './modules/admin-orders/admin-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    ProductsModule,
    UserAuthModule,
    OrdersModule,
    AdminAuthModule,
    AdminProductsModule,
    AdminOrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
