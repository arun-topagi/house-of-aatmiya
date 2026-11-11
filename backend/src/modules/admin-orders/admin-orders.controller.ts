import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminOrdersService } from './admin-orders.service';
import { order_status } from '@prisma/client';
import {
  AdminGuard,
  JwtAuthGuard,
} from '../admin-auth/guards/jwt-auth.guard';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  async getOrders(
    @Query('status') status?: order_status,
    @Query('search') search?: string,
  ) {
    return this.adminOrdersService.getOrders({ status, search });
  }

  @Get('metrics')
  async getMetrics() {
    return this.adminOrdersService.getDashboardMetrics();
  }

  @Get('kitchen-prep')
  async getKitchenPrep() {
    return this.adminOrdersService.getKitchenPrepSummary();
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status?: order_status;
      advancePaid?: number;
      adminNotes?: string;
    },
  ) {
    return this.adminOrdersService.updateOrderStatusAndAdvance(id, body);
  }
}
