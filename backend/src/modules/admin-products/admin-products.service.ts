import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorefrontMode } from '@prisma/client';

export interface AdminVariantInput {
  id?: string;
  sizePack: string;
  costPrice?: number;
  price: number;
  stockQty?: number;
  isMadeToBatch?: boolean;
  isAvailable?: boolean;
}

export interface UpsertAdminProductDto {
  sku?: string;
  categorySlug?: string;
  categoryId?: string;
  name: Record<string, unknown> | string;
  description?: Record<string, unknown> | string;
  usage?: Record<string, unknown> | string;
  images?: string[] | Record<string, unknown>;
  isFeatured?: boolean;
  isActive?: boolean;
  variants?: AdminVariantInput[];
}

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private formatProductRow(p: {
    id: string;
    sku: string;
    name: unknown;
    description: unknown;
    usage: unknown;
    images: unknown;
    isFeatured: boolean | null;
    isActive: boolean | null;
    category: {
      id: string;
      slug: string;
      modeGroup: StorefrontMode;
      name: unknown;
    } | null;
    variants: Array<{
      id: string;
      sizePack: string;
      costPrice: unknown;
      price: unknown;
      stockQty: number;
      isMadeToBatch: boolean;
      isAvailable: boolean | null;
    }>;
  }) {
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

    const totalStock = variants.reduce((sum, v) => sum + (v.stockQty || 0), 0);
    const hasBatch = variants.some((v) => v.isMadeToBatch);
    const stockStatus =
      hasBatch || totalStock > 10
        ? 'IN_STOCK'
        : totalStock > 0
          ? 'LOW_STOCK'
          : 'OUT_OF_STOCK';

    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: p.description,
      usage: p.usage,
      images: p.images,
      isFeatured: Boolean(p.isFeatured),
      isActive: Boolean(p.isActive),
      stockStatus,
      totalStock,
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
  }

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

    return products.map((p) => this.formatProductRow(p));
  }

  async createProduct(payload: UpsertAdminProductDto) {
    let categoryId = payload.categoryId || null;
    if (!categoryId && payload.categorySlug) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: payload.categorySlug },
      });
      if (cat) categoryId = cat.id;
    }

    const sku =
      payload.sku?.trim() ||
      `HOA-${Math.floor(100 + Math.random() * 900)}`;

    const nameJson =
      typeof payload.name === 'string'
        ? { en: payload.name }
        : (payload.name ?? { en: 'Untitled Creation' });
    const descJson =
      typeof payload.description === 'string'
        ? { en: payload.description }
        : (payload.description ?? { en: '' });
    const usageJson =
      typeof payload.usage === 'string'
        ? { en: payload.usage }
        : (payload.usage ?? { en: '' });

    const variantsInput =
      payload.variants && payload.variants.length > 0
        ? payload.variants
        : [{ sizePack: 'Standard', costPrice: 200, price: 490, stockQty: 15 }];

    const created = await this.prisma.product.create({
      data: {
        sku,
        categoryId,
        name: nameJson as object,
        description: descJson as object,
        usage: usageJson as object,
        images: (payload.images ?? []) as object,
        isFeatured: payload.isFeatured ?? false,
        isActive: payload.isActive ?? true,
        variants: {
          create: variantsInput.map((v) => ({
            sizePack: String(v.sizePack || 'Standard'),
            costPrice: Number(v.costPrice) || Math.round((Number(v.price) || 0) * 0.42),
            price: Number(v.price) || 0,
            stockQty: v.stockQty !== undefined ? Number(v.stockQty) : 15,
            isMadeToBatch: Boolean(v.isMadeToBatch),
            isAvailable: v.isAvailable ?? true,
          })),
        },
      },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
      },
    });

    return this.formatProductRow(created);
  }

  async updateProduct(productId: string, payload: UpsertAdminProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    let categoryId = payload.categoryId ?? existing.categoryId;
    if (payload.categorySlug) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: payload.categorySlug },
      });
      if (cat) categoryId = cat.id;
    }

    const nameJson =
      payload.name !== undefined
        ? typeof payload.name === 'string'
          ? { en: payload.name }
          : payload.name
        : existing.name;
    const descJson =
      payload.description !== undefined
        ? typeof payload.description === 'string'
          ? { en: payload.description }
          : payload.description
        : existing.description;
    const usageJson =
      payload.usage !== undefined
        ? typeof payload.usage === 'string'
          ? { en: payload.usage }
          : payload.usage
        : existing.usage;

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        ...(payload.sku ? { sku: payload.sku.trim() } : {}),
        categoryId,
        name: nameJson as object,
        description: descJson as object,
        usage: usageJson as object,
        ...(payload.images !== undefined
          ? { images: payload.images as object }
          : {}),
        ...(payload.isFeatured !== undefined
          ? { isFeatured: payload.isFeatured }
          : {}),
        ...(payload.isActive !== undefined
          ? { isActive: payload.isActive }
          : {}),
      },
    });

    if (Array.isArray(payload.variants) && payload.variants.length > 0) {
      for (const v of payload.variants) {
        const priceNum = Number(v.price) || 0;
        const costNum =
          v.costPrice !== undefined && Number(v.costPrice) > 0
            ? Number(v.costPrice)
            : Math.round(priceNum * 0.42);

        if (v.id && existing.variants.some((ev) => ev.id === v.id)) {
          await this.prisma.productVariant.update({
            where: { id: v.id },
            data: {
              sizePack: String(v.sizePack),
              costPrice: costNum,
              price: priceNum,
              ...(v.stockQty !== undefined
                ? { stockQty: Number(v.stockQty) }
                : {}),
              ...(v.isMadeToBatch !== undefined
                ? { isMadeToBatch: Boolean(v.isMadeToBatch) }
                : {}),
              ...(v.isAvailable !== undefined
                ? { isAvailable: Boolean(v.isAvailable) }
                : {}),
            },
          });
        } else {
          await this.prisma.productVariant.create({
            data: {
              productId,
              sizePack: String(v.sizePack),
              costPrice: costNum,
              price: priceNum,
              stockQty: v.stockQty !== undefined ? Number(v.stockQty) : 15,
              isMadeToBatch: Boolean(v.isMadeToBatch),
              isAvailable: v.isAvailable ?? true,
            },
          });
        }
      }
    }

    const refreshed = await this.prisma.product.findUniqueOrThrow({
      where: { id: productId },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
      },
    });

    return this.formatProductRow(refreshed);
  }

  async toggleProductStatus(productId: string, isActive: boolean) {
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { isActive },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
      },
    });
    return this.formatProductRow(updated);
  }

  async toggleProductFeatured(productId: string, isFeatured: boolean) {
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { isFeatured },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
      },
    });
    return this.formatProductRow(updated);
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
