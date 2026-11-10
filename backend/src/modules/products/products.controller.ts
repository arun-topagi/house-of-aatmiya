import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { GetPublicProductsQueryDto } from './dto/get-public-products-query.dto';
import { StorefrontMode } from '@prisma/client';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('store-settings')
  async getStoreSettings() {
    return this.productsService.getStoreSettings();
  }

  @Get('categories')
  async getCategories(@Query('mode') mode?: StorefrontMode) {
    return this.productsService.getPublicCategories(mode);
  }

  @Get('products')
  async getProducts(@Query() query: GetPublicProductsQueryDto) {
    return this.productsService.getPublicProducts(query);
  }

  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.getPublicProductById(id);
  }
}
