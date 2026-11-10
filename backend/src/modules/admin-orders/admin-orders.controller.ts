import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { AdminOrdersService } from './admin-orders.service';
import { order_status } from '@prisma/client';

@Controller('admin/orders')
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

  @Get('reorder-radar')
  async getReorderRadar() {
    return this.adminOrdersService.getReorderRadar();
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
