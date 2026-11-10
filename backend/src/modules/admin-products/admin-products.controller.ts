import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AdminProductsService } from './admin-products.service';
import { StorefrontMode } from '@prisma/client';

@Controller('admin')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get('products')
  async getAllProducts() {
    return this.adminProductsService.getAllProductsWithMargins();
  }

  @Patch('variants/:id')
  async updateVariant(
    @Param('id') id: string,
    @Body()
    body: {
      costPrice?: number;
      price?: number;
      stockQty?: number;
      isAvailable?: boolean;
    },
  ) {
    return this.adminProductsService.updateVariantPricingAndStock(id, body);
  }

  @Patch('store-settings')
  async updateStoreSettings(
    @Body()
    body: {
      defaultMode?: StorefrontMode;
      allowModeSwitching?: boolean;
      nextFoodBatchLabel?: string;
      whatsappPhone?: string;
      upiVpa?: string;
    },
  ) {
    return this.adminProductsService.updateStoreSettings(body);
  }
}
