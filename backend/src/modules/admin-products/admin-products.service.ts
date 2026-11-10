import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorefrontMode } from '@prisma/client';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProductsWithMargins() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        variants: {
          orderBy: { price: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return products.map((p) => {
      const variants = p.variants.map((v) => {
        const cost = Number(v.costPrice) || 0;
        const price = Number(v.price) || 0;
        const markupMultiple =
          cost > 0 ? Number((price / cost).toFixed(2)) : 2.5;
        const netMarginInr = price - cost;
        return {
          id: v.id,
          sizePack: v.sizePack,
          costPrice: cost,
          price,
          markupMultiple,
          netMarginInr,
          isBelowTargetMarkup: markupMultiple < 2.0,
          stockQty: v.stockQty,
          isMadeToBatch: v.isMadeToBatch,
          isAvailable: Boolean(v.isAvailable),
        };
      });

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        description: p.description,
        usage: p.usage,
        images: p.images,
        isFeatured: Boolean(p.isFeatured),
        isActive: Boolean(p.isActive),
        category: p.category
          ? {
              id: p.category.id,
              slug: p.category.slug,
              modeGroup: p.category.modeGroup,
              name: p.category.name,
            }
          : null,
        variants,
      };
    });
  }

  async updateVariantPricingAndStock(
    variantId: string,
    payload: {
      costPrice?: number;
      price?: number;
      stockQty?: number;
      isAvailable?: boolean;
    },
  ) {
    const existing = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!existing) {
      throw new NotFoundException('Product variant not found');
    }

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(payload.costPrice !== undefined
          ? { costPrice: payload.costPrice }
          : {}),
        ...(payload.price !== undefined ? { price: payload.price } : {}),
        ...(payload.stockQty !== undefined
          ? { stockQty: payload.stockQty }
          : {}),
        ...(payload.isAvailable !== undefined
          ? { isAvailable: payload.isAvailable }
          : {}),
      },
    });

    const cost = Number(updated.costPrice) || 0;
    const price = Number(updated.price) || 0;
    return {
      id: updated.id,
      sizePack: updated.sizePack,
      costPrice: cost,
      price,
      markupMultiple: cost > 0 ? Number((price / cost).toFixed(2)) : 2.5,
      stockQty: updated.stockQty,
      isAvailable: Boolean(updated.isAvailable),
    };
  }

  async updateStoreSettings(payload: {
    defaultMode?: StorefrontMode;
    allowModeSwitching?: boolean;
    nextFoodBatchLabel?: string;
    whatsappPhone?: string;
    upiVpa?: string;
  }) {
    return this.prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: {
        ...(payload.defaultMode ? { defaultMode: payload.defaultMode } : {}),
        ...(payload.allowModeSwitching !== undefined
          ? { allowModeSwitching: payload.allowModeSwitching }
          : {}),
        ...(payload.nextFoodBatchLabel !== undefined
          ? { nextFoodBatchLabel: payload.nextFoodBatchLabel }
          : {}),
        ...(payload.whatsappPhone
          ? { whatsappPhone: payload.whatsappPhone }
          : {}),
        ...(payload.upiVpa ? { upiVpa: payload.upiVpa } : {}),
      },
      create: {
        id: 'default',
        defaultMode: payload.defaultMode || StorefrontMode.ALL,
        allowModeSwitching: payload.allowModeSwitching ?? true,
        nextFoodBatchLabel:
          payload.nextFoodBatchLabel ||
          'Next Fresh Batch: Friday (Orders close Wednesday)',
        whatsappPhone: payload.whatsappPhone || '919876543210',
        upiVpa: payload.upiVpa || 'aatmiya@okaxis',
      },
    });
  }
}
