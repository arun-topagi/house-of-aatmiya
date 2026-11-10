import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { order_status } from '@prisma/client';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrders(params: {
    status?: order_status;
    search?: string;
  }) {
    const whereClause: any = {};
    if (params.status) {
      whereClause.status = params.status;
    }

    const orders = await this.prisma.orders.findMany({
      where: whereClause,
      include: {
        users: true,
        addresses: true,
        order_items: {
          include: {
            product_variants: {
              include: {
                product: {
                  include: { category: true },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const settings = await this.prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });
    const upiVpa = settings?.upiVpa || 'aatmiya@okaxis';

    const formatted = orders.map((o) => {
      const total = Number(o.total_amount);
      const advancePaid = Number(o.advance_paid);
      const balanceDue = Math.max(0, total - advancePaid);

      // Calculate whether order has food/hampers (100% advance recommended) or clothing only (50%+ advance)
      const hasFoodOrHamper = o.order_items.some(
        (item) =>
          item.product_variants.isMadeToBatch ||
          item.product_variants.product.category?.slug === 'kids-snacks' ||
          item.product_variants.product.category?.slug === 'hampers',
      );

      const recommendedAdvance = hasFoodOrHamper
        ? total
        : Math.ceil(total * 0.5);

      const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent('The House of Aatmiya')}&am=${recommendedAdvance}&cu=INR&tn=${encodeURIComponent(`Order ${o.order_number}`)}`;

      const customerPhone = o.users.phone.replace(/\D/g, '').slice(-10);
      const customerName = o.users.name || 'Valued Guest';

      const waPaymentRequestMessage = [
        `Namaste ${customerName}! 🙏 Thank you for speaking with me regarding your *The House of Aatmiya* Order *#${o.order_number}*.`,
        '',
        `*Order Total:* ₹${total}`,
        `*Advance Requested (${hasFoodOrHamper ? '100% for Fresh Food/Hamper' : '50% Booking Advance'}):* ₹${recommendedAdvance}`,
        '',
        `You can pay via any UPI app (GPay / PhonePe / Paytm) to *${upiVpa}* or tap:`,
        upiDeepLink,
        '',
        `Once paid, please share the screenshot here so I can schedule your order in our batch! — Snehal`,
      ].join('\n');

      const whatsappUpiRequestUrl = `https://wa.me/91${customerPhone}?text=${encodeURIComponent(waPaymentRequestMessage)}`;

      return {
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        totalAmount: total,
        advancePaid,
        balanceDue,
        recommendedAdvance,
        deliveryType: o.delivery_type,
        giftNote: o.gift_note,
        adminNotes: o.admin_notes,
        createdAt: o.created_at,
        upiDeepLink,
        whatsappUpiRequestUrl,
        customer: {
          id: o.users.id,
          name: customerName,
          phone: customerPhone,
          isPhoneVerified: Boolean(o.users.is_phone_verified),
        },
        address: {
          flatOrHouse: o.addresses.flat_or_house,
          areaOrSociety: o.addresses.area_or_society,
          city: o.addresses.city,
          state: o.addresses.state,
          pincode: o.addresses.pincode,
          landmark: o.addresses.landmark || '',
          isSocietyResident: Boolean(o.addresses.is_society_resident),
          latitude:
            o.addresses.latitude !== null ? Number(o.addresses.latitude) : null,
          longitude:
            o.addresses.longitude !== null
              ? Number(o.addresses.longitude)
              : null,
          googleMapsUrl: o.addresses.google_maps_url || '',
          isMobileConfirmed: Boolean(o.addresses.is_mobile_confirmed),
        },
        items: o.order_items.map((item) => {
          const prodName =
            (item.product_variants.product.name as Record<string, string>) ||
            {};
          return {
            id: item.id,
            variantId: item.variant_id,
            sku: item.product_variants.product.sku,
            productName: prodName.en || item.product_variants.product.sku,
            categorySlug:
              item.product_variants.product.category?.slug || 'general',
            sizePack: item.product_variants.sizePack,
            quantity: item.quantity,
            unitPrice: Number(item.price_at_purchase),
            costPrice: Number(item.product_variants.costPrice),
            isMadeToBatch: Boolean(item.product_variants.isMadeToBatch),
          };
        }),
      };
    });

    if (params.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      return formatted.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q),
      );
    }

    return formatted;
  }

  async getDashboardMetrics() {
    const orders = await this.getOrders({});
    const activeOrders = orders.filter((o) => o.status !== 'CANCELLED');

    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalAdvanceCollected = activeOrders.reduce(
      (sum, o) => sum + o.advancePaid,
      0,
    );

    let estimatedCost = 0;
    for (const o of activeOrders) {
      for (const item of o.items) {
        estimatedCost += item.costPrice * item.quantity;
      }
    }

    return {
      totalOrders: orders.length,
      pendingCallsCount: orders.filter((o) => o.status === 'PENDING_CALL')
        .length,
      awaitingUpiCount: orders.filter(
        (o) => o.status === 'CONFIRMED_AWAITING_UPI',
      ).length,
      inKitchenPrepCount: orders.filter((o) => o.status === 'PAID_IN_PREP')
        .length,
      completedCount: orders.filter((o) => o.status === 'COMPLETED').length,
      totalRevenue,
      totalAdvanceCollected,
      estimatedNetMargin: Math.max(0, totalRevenue - estimatedCost),
    };
  }

  async getKitchenPrepSummary() {
    const prepOrders = await this.prisma.orders.findMany({
      where: {
        status: {
          in: [
            order_status.PAID_IN_PREP,
            order_status.CONFIRMED_AWAITING_UPI,
            order_status.PENDING_CALL,
          ],
        },
      },
      include: {
        order_items: {
          include: {
            product_variants: {
              include: {
                product: { include: { category: true } },
              },
            },
          },
        },
      },
    });

    const batchMap = new Map<
      string,
      {
        variantId: string;
        sku: string;
        productName: string;
        sizePack: string;
        totalUnits: number;
        paidUnits: number;
        pendingUnits: number;
      }
    >();

    for (const order of prepOrders) {
      const isPaid = order.status === order_status.PAID_IN_PREP;
      for (const item of order.order_items) {
        const variant = item.product_variants;
        const isFoodOrBatch =
          variant.isMadeToBatch ||
          variant.product.category?.slug === 'kids-snacks' ||
          variant.product.category?.slug === 'hampers';

        if (!isFoodOrBatch) continue;

        const prodName =
          (variant.product.name as Record<string, string>)?.en ||
          variant.product.sku;
        const key = variant.id;
        const existing = batchMap.get(key) || {
          variantId: variant.id,
          sku: variant.product.sku,
          productName: prodName,
          sizePack: variant.sizePack,
          totalUnits: 0,
          paidUnits: 0,
          pendingUnits: 0,
        };

        existing.totalUnits += item.quantity;
        if (isPaid) {
          existing.paidUnits += item.quantity;
        } else {
          existing.pendingUnits += item.quantity;
        }
        batchMap.set(key, existing);
      }
    }

    return Array.from(batchMap.values());
  }

  async getReorderRadar() {
    const orders = await this.getOrders({});
    const customerMap = new Map<
      string,
      {
        customerName: string;
        phone: string;
        areaOrSociety: string;
        lastOrderNumber: string;
        lastOrderDate: Date;
        itemsSummary: string[];
        whatsappFollowUpUrl: string;
      }
    >();

    for (const order of orders) {
      const hasSnacks = order.items.some(
        (i) => i.categorySlug === 'kids-snacks',
      );
      if (!hasSnacks) continue;

      if (!customerMap.has(order.customer.phone)) {
        const snackNames = order.items
          .filter((i) => i.categorySlug === 'kids-snacks')
          .map((i) => i.productName);

        const msg = `Hi ${order.customer.name}! 🙏 Hope the family and kids enjoyed the *${snackNames.join(' & ')}* from *The House of Aatmiya*. I am preparing a fresh batch this week—would you like me to reserve a jar for you? — Snehal`;

        customerMap.set(order.customer.phone, {
          customerName: order.customer.name,
          phone: order.customer.phone,
          areaOrSociety: `${order.address.flatOrHouse}, ${order.address.areaOrSociety}`,
          lastOrderNumber: order.orderNumber,
          lastOrderDate: order.createdAt || new Date(),
          itemsSummary: snackNames,
          whatsappFollowUpUrl: `https://wa.me/91${order.customer.phone}?text=${encodeURIComponent(msg)}`,
        });
      }
    }

    return Array.from(customerMap.values());
  }

  async updateOrderStatusAndAdvance(
    id: string,
    payload: {
      status?: order_status;
      advancePaid?: number;
      adminNotes?: string;
    },
  ) {
    const existing = await this.prisma.orders.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.orders.update({
      where: { id },
      data: {
        ...(payload.status ? { status: payload.status } : {}),
        ...(payload.advancePaid !== undefined
          ? { advance_paid: payload.advancePaid }
          : {}),
        ...(payload.adminNotes !== undefined
          ? { admin_notes: payload.adminNotes }
          : {}),
        updated_at: new Date(),
      },
    });
  }
}
