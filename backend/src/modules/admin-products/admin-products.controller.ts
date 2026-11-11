import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  AdminProductsService,
  UpsertAdminProductDto,
} from './admin-products.service';
import { StorefrontMode } from '@prisma/client';
import {
  AdminGuard,
  JwtAuthGuard,
} from '../admin-auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get('products')
  async getAllProducts() {
    return this.adminProductsService.getAllProductsWithMargins();
  }

  @Post('products')
  async createProduct(@Body() body: UpsertAdminProductDto) {
    return this.adminProductsService.createProduct(body);
  }

  @Put('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() body: UpsertAdminProductDto,
  ) {
    return this.adminProductsService.updateProduct(id, body);
  }

  @Patch('products/:id/toggle')
  async toggleProductStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminProductsService.toggleProductStatus(
      id,
      Boolean(body.isActive),
    );
  }

  @Patch('products/:id/featured')
  async toggleProductFeatured(
    @Param('id') id: string,
    @Body() body: { isFeatured: boolean },
  ) {
    return this.adminProductsService.toggleProductFeatured(
      id,
      Boolean(body.isFeatured),
    );
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
