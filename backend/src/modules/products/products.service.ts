import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GetPublicProductsQueryDto } from './dto/get-public-products-query.dto';
import { StorefrontMode } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoreSettings() {
    let settings = await this.prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await this.prisma.storeSettings.create({
        data: {
          id: 'default',
          defaultMode: StorefrontMode.ALL,
          allowModeSwitching: true,
          nextFoodBatchLabel:
            'Next Fresh Batch: Friday (Orders close Wednesday)',
          whatsappPhone: '919876543210',
          upiVpa: 'aatmiya@okaxis',
        },
      });
    }

    return settings;
  }

  async getPublicCategories(mode?: StorefrontMode) {
    const whereClause: any = { isActive: true };
    if (mode && mode !== StorefrontMode.ALL) {
      whereClause.modeGroup = mode;
    }

    const categories = await this.prisma.category.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      modeGroup: cat.modeGroup,
      name: cat.name,
      description: cat.description,
    }));
  }

  async getPublicProducts(query: GetPublicProductsQueryDto) {
    const whereClause: any = {
      isActive: true,
      category: {
        isActive: true,
      },
    };

    if (query.mode && query.mode !== StorefrontMode.ALL) {
      whereClause.category.modeGroup = query.mode;
    }

    if (query.categorySlug) {
      whereClause.category.slug = query.categorySlug;
    }

    if (query.featuredOnly === 'true') {
      whereClause.isFeatured = true;
    }

    const products = await this.prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'asc' }],
    });

    const filtered = query.search
      ? products.filter((p) => {
          const nameObj = (p.name as Record<string, string>) || {};
          const descObj = (p.description as Record<string, string>) || {};
          const q = query.search.toLowerCase();
          return (
            (nameObj.en || '').toLowerCase().includes(q) ||
            (nameObj.subtitle || '').toLowerCase().includes(q) ||
            (descObj.en || '').toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
          );
        })
      : products;

    return {
      items: filtered.map((p) => this.formatProduct(p)),
      total: filtered.length,
    };
  }

  async getPublicProductById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id }, { sku: id }],
        isActive: true,
      },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.formatProduct(product);
  }

  private formatProduct(p: any) {
    const images = Array.isArray(p.images) ? p.images : [];
    return {
      id: p.id,
      sku: p.sku,
      categoryId: p.categoryId,
      category: p.category
        ? {
            id: p.category.id,
            slug: p.category.slug,
            modeGroup: p.category.modeGroup,
            name: p.category.name,
          }
        : null,
      name: p.name,
      description: p.description,
      usage: p.usage,
      images,
      imageUrl: images[0] || '',
      isFeatured: Boolean(p.isFeatured),
      variants: (p.variants || []).map((v: any) => ({
        id: v.id,
        sizePack: v.sizePack,
        price: Number(v.price),
        stockQty: v.stockQty,
        isMadeToBatch: Boolean(v.isMadeToBatch),
        isAvailable: Boolean(v.isAvailable),
      })),
    };
  }
}
