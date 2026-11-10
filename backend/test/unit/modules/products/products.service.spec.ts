import { ProductsService } from '../../../src/modules/products/products.service';
import { StorefrontMode } from '@prisma/client';

describe('ProductsService', () => {
  let service: ProductsService;
  const mockPrisma: any = {
    storeSettings: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService(mockPrisma);
  });

  it('returns default store settings when present', async () => {
    mockPrisma.storeSettings.findUnique.mockResolvedValue({
      id: 'default',
      defaultMode: StorefrontMode.ALL,
      allowModeSwitching: true,
    });

    const settings = await service.getStoreSettings();
    expect(settings.defaultMode).toBe(StorefrontMode.ALL);
    expect(settings.allowModeSwitching).toBe(true);
  });

  it('filters categories by storefront mode when mode is DRESS_AND_GIFTS or FOODS_ONLY', async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      {
        id: 'cat-1',
        slug: 'dresses',
        modeGroup: StorefrontMode.DRESS_AND_GIFTS,
        name: { en: "Women's Pure Cotton Dresses" },
      },
    ]);

    const res = await service.getPublicCategories(
      StorefrontMode.DRESS_AND_GIFTS,
    );
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, modeGroup: StorefrontMode.DRESS_AND_GIFTS },
      }),
    );
    expect(res).toHaveLength(1);
    expect(res[0].slug).toBe('dresses');
  });
});
