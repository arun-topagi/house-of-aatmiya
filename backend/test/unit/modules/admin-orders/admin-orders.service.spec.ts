import { AdminOrdersService } from '../../../src/modules/admin-orders/admin-orders.service';

describe('AdminOrdersService', () => {
  let service: AdminOrdersService;
  const mockPrisma: any = {
    orders: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    storeSettings: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminOrdersService(mockPrisma);
  });

  it('aggregates kitchen prep quantities for batch food items', async () => {
    mockPrisma.orders.findMany.mockResolvedValue([
      {
        status: 'PAID_IN_PREP',
        order_items: [
          {
            quantity: 3,
            product_variants: {
              id: 'var-1',
              sizePack: '250g Glass Jar',
              isMadeToBatch: true,
              product: {
                sku: 'HOA-KS-01',
                name: { en: 'Sprouted Ragi-Almond-Jaggery Health Drink Mix' },
                category: { slug: 'kids-snacks' },
              },
            },
          },
        ],
      },
    ]);

    const summary = await service.getKitchenPrepSummary();
    expect(summary).toHaveLength(1);
    expect(summary[0].totalUnits).toBe(3);
    expect(summary[0].paidUnits).toBe(3);
  });
});
