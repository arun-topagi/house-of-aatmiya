import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { delivery_type, order_status, payment_method } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string | null, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item.');
    }

    const cleanedPhone = dto.address.phone.replace(/\D/g, '').slice(-10);

    // 1. Resolve or upsert User
    let user = userId
      ? await this.prisma.users.findUnique({ where: { id: userId } })
      : null;

    if (!user) {
      user = await this.prisma.users.upsert({
        where: { phone: cleanedPhone },
        update: {
          name: dto.address.fullName.trim(),
          updated_at: new Date(),
        },
        create: {
          phone: cleanedPhone,
          name: dto.address.fullName.trim(),
          is_phone_verified: Boolean(userId),
        },
      });
    } else if (dto.address.fullName?.trim()) {
      await this.prisma.users.update({
        where: { id: user.id },
        data: { name: dto.address.fullName.trim(), updated_at: new Date() },
      });
    }

    // 2. Upsert default Address with GPS coordinates
    const mapsUrl =
      dto.address.googleMapsUrl ||
      (dto.address.latitude !== undefined && dto.address.longitude !== undefined
        ? `https://maps.google.com/?q=${dto.address.latitude},${dto.address.longitude}`
        : null);

    const existingAddress = await this.prisma.addresses.findFirst({
      where: { user_id: user.id },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });

    const address = existingAddress
      ? await this.prisma.addresses.update({
          where: { id: existingAddress.id },
          data: {
            flat_or_house: dto.address.flatOrHouse.trim(),
            area_or_society: dto.address.areaOrSociety.trim(),
            city: dto.address.city.trim(),
            state: dto.address.state?.trim() || 'Maharashtra',
            pincode: dto.address.pincode.trim(),
            landmark: dto.address.landmark?.trim() || '',
            is_society_resident: Boolean(dto.address.isSocietyResident),
            latitude: dto.address.latitude ?? existingAddress.latitude,
            longitude: dto.address.longitude ?? existingAddress.longitude,
            google_maps_url: mapsUrl ?? existingAddress.google_maps_url,
            is_mobile_confirmed: Boolean(
              dto.address.isMobileConfirmed ||
                (dto.address.latitude && dto.address.longitude) ||
                existingAddress.is_mobile_confirmed,
            ),
            is_default: true,
            updated_at: new Date(),
          },
        })
      : await this.prisma.addresses.create({
          data: {
            user_id: user.id,
            flat_or_house: dto.address.flatOrHouse.trim(),
            area_or_society: dto.address.areaOrSociety.trim(),
            city: dto.address.city.trim(),
            state: dto.address.state?.trim() || 'Maharashtra',
            pincode: dto.address.pincode.trim(),
            landmark: dto.address.landmark?.trim() || '',
            is_society_resident: Boolean(dto.address.isSocietyResident),
            latitude: dto.address.latitude ?? null,
            longitude: dto.address.longitude ?? null,
            google_maps_url: mapsUrl,
            is_mobile_confirmed: Boolean(
              dto.address.isMobileConfirmed ||
                (dto.address.latitude && dto.address.longitude),
            ),
            is_default: true,
          },
        });

    // 3. Validate variants and compute total
    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      include: { product: true },
    });

    if (variants.length === 0) {
      throw new BadRequestException('Selected product variants were not found.');
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    let subtotal = 0;
    const lineItemsData = [];
    const summaryLines: string[] = [];

    for (const item of dto.items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        throw new BadRequestException(`Variant ${item.variantId} is unavailable.`);
      }
      const unitPrice = Number(variant.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      lineItemsData.push({
        variant_id: variant.id,
        quantity: item.quantity,
        price_at_purchase: unitPrice,
      });

      const prodNameObj = (variant.product.name as Record<string, string>) || {};
      summaryLines.push(
        `• ${item.quantity}x ${prodNameObj.en || variant.product.sku} (${variant.sizePack}) — ₹${lineTotal}`,
      );
    }

    const isSociety = Boolean(dto.address.isSocietyResident);
    const shippingFee = isSociety || subtotal >= 1500 ? 0 : 90;
    const totalAmount = subtotal + shippingFee;

    const orderCount = await this.prisma.orders.count();
    const orderNumber = `HOA-${1001 + orderCount}`;

    const createdOrder = await this.prisma.orders.create({
      data: {
        order_number: orderNumber,
        user_id: user.id,
        address_id: address.id,
        total_amount: totalAmount,
        advance_paid: 0,
        delivery_type: isSociety
          ? delivery_type.SOCIETY_HAND_DELIVERY
          : delivery_type.COURIER_DELIVERY,
        status: order_status.PENDING_CALL,
        payment_method: payment_method.UPI_ADVANCE,
        gift_note: dto.giftNote?.trim() || null,
        order_items: {
          create: lineItemsData,
        },
      },
      include: {
        order_items: {
          include: {
            product_variants: {
              include: { product: true },
            },
          },
        },
        addresses: true,
        users: true,
      },
    });

    // 4. Build WhatsApp Concierge URL
    const settings = await this.prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });
    const conciergePhone = settings?.whatsappPhone || '919876543210';

    const waText = [
      `Namaste! 🙏 I have placed Order *#${orderNumber}* on *The House of Aatmiya*:`,
      '',
      ...summaryLines,
      '',
      `*Subtotal:* ₹${subtotal}`,
      `*Delivery:* ${isSociety ? 'Society Hand-Delivery (FREE)' : shippingFee === 0 ? 'FREE Courier' : `₹${shippingFee}`}`,
      `*Total Payable:* ₹${totalAmount}`,
      '',
      `*Customer:* ${dto.address.fullName} (+91 ${cleanedPhone} — OTP Verified ✅)`,
      `*Address:* ${dto.address.flatOrHouse}, ${dto.address.areaOrSociety}, ${dto.address.city} - ${dto.address.pincode}`,
      ...(mapsUrl ? [`*GPS Pin:* ${mapsUrl}`] : []),
      ...(dto.giftNote ? [`*Gift Note:* "${dto.giftNote}"`] : []),
      '',
      `Please call me to confirm sizes/fresh batch and share the UPI link!`,
    ].join('\n');

    const whatsappConciergeUrl = `https://wa.me/${conciergePhone}?text=${encodeURIComponent(waText)}`;

    return {
      id: createdOrder.id,
      orderNumber: createdOrder.order_number,
      status: createdOrder.status,
      totalAmount: Number(createdOrder.total_amount),
      shippingFee,
      deliveryType: createdOrder.delivery_type,
      whatsappConciergeUrl,
      createdAt: createdOrder.created_at,
    };
  }

  async getMyOrders(userId: string) {
    const orders = await this.prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: {
            product_variants: {
              include: { product: true },
            },
          },
        },
        addresses: true,
        users: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      status: o.status,
      totalAmount: Number(o.total_amount),
      advancePaid: Number(o.advance_paid),
      deliveryType: o.delivery_type,
      giftNote: o.gift_note,
      createdAt: o.created_at,
      address: o.addresses
        ? {
            fullName: o.users?.name || 'Aatmiya Guest',
            phone: o.users?.phone || '',
            flatOrHouse: o.addresses.flat_or_house,
            areaOrSociety: o.addresses.area_or_society,
            city: o.addresses.city,
            state: o.addresses.state,
            pincode: o.addresses.pincode,
            landmark: o.addresses.landmark || '',
            isSocietyResident: Boolean(o.addresses.is_society_resident),
          }
        : undefined,
      items: o.order_items.map((item) => {
        const unitPrice = Number(item.price_at_purchase);
        return {
          id: item.id,
          variantId: item.variant_id,
          quantity: item.quantity,
          unitPrice,
          priceAtPurchase: unitPrice,
          subtotal: unitPrice * item.quantity,
          sizePack: item.product_variants.sizePack,
          productName: item.product_variants.product.name,
        };
      }),
    }));
  }

  async getOrderById(id: string, userId?: string) {
    const order = await this.prisma.orders.findFirst({
      where: {
        id,
        ...(userId ? { user_id: userId } : {}),
      },
      include: {
        order_items: {
          include: {
            product_variants: {
              include: { product: true },
            },
          },
        },
        addresses: true,
        users: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      totalAmount: Number(order.total_amount),
      advancePaid: Number(order.advance_paid),
      deliveryType: order.delivery_type,
      giftNote: order.gift_note,
      createdAt: order.created_at,
      address: order.addresses
        ? {
            fullName: order.users?.name || 'Aatmiya Guest',
            phone: order.users?.phone || '',
            flatOrHouse: order.addresses.flat_or_house,
            areaOrSociety: order.addresses.area_or_society,
            city: order.addresses.city,
            state: order.addresses.state,
            pincode: order.addresses.pincode,
            landmark: order.addresses.landmark || '',
            isSocietyResident: Boolean(order.addresses.is_society_resident),
          }
        : undefined,
      items: order.order_items.map((item) => {
        const unitPrice = Number(item.price_at_purchase);
        return {
          id: item.id,
          variantId: item.variant_id,
          quantity: item.quantity,
          unitPrice,
          priceAtPurchase: unitPrice,
          subtotal: unitPrice * item.quantity,
          sizePack: item.product_variants.sizePack,
          productName: item.product_variants.product.name,
        };
      }),
    };
  }
}
