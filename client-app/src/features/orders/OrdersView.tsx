'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, AdvisoryStrip, BottomNav, Footer } from '@/components';
import { Badge, Button, Icon } from '@/elements';
import { CustomerOrder, orderService } from '@/services';
import { useAppSelector } from '@/store';

export const OrdersView: React.FC = () => {
  const router = useRouter();
  const { isHydrated, isAuthenticated, accessToken, user } = useAppSelector(
    (s) => s.userAuth,
  );
  const { whatsappPhone } = useAppSelector((s) => s.app);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/profile');
    }
  }, [isHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    orderService
      .getMyOrders()
      .then((list) => {
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [isHydrated, isAuthenticated, accessToken]);

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 pt-16 sm:pt-20 pb-28">
        <AdvisoryStrip />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-1">
                <Link
                  href="/"
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Icon name="home" className="text-sm" />
                  <span>Home</span>
                </Link>
                <Icon name="chevron_right" className="text-sm" />
                <span className="text-primary font-bold">My Orders</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                My Orders &amp; Batch History
              </h1>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-label-md font-label-md text-primary hover:underline"
            >
              <Icon name="add_shopping_cart" className="text-lg" />
              <span>New Order</span>
            </Link>
          </div>

          {!isAuthenticated ? (
            <div className="bg-surface-container-lowest rounded-2xl p-10 text-center border border-outline-variant/25 shadow-sm">
              <Icon
                name="lock"
                className="text-5xl text-primary mb-3 block mx-auto"
              />
              <h2 className="font-headline-md text-on-surface mb-2">
                Sign In with WhatsApp OTP to View Orders
              </h2>
              <p className="text-body-md text-on-surface-variant max-w-md mx-auto mb-6">
                Verify your 10-digit WhatsApp number to track your active fresh
                food batches and adult cotton dress orders.
              </p>
              <Link href="/profile" className="inline-block">
                <Button type="button" variant="primary" className="px-6 py-3">
                  <Icon name="verified_user" className="text-lg" />
                  <span>Go to WhatsApp OTP Login</span>
                </Button>
              </Link>
            </div>
          ) : loading ? (
            <div className="bg-surface-container-lowest rounded-2xl p-10 text-center border border-outline-variant/25">
              <p className="text-body-md text-on-surface-variant">
                Loading your orders for +91 {user.phone}...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-10 text-center border border-outline-variant/25 shadow-sm">
              <Icon
                name="receipt_long"
                className="text-5xl text-outline mb-3 block mx-auto"
              />
              <h2 className="font-headline-md text-on-surface mb-2">
                No Orders Yet
              </h2>
              <p className="text-body-md text-on-surface-variant max-w-md mx-auto mb-6">
                You haven&apos;t placed an order under +91 {user.phone} yet.
                Explore our weekly fresh snacks or pure cotton boutique!
              </p>
              <Link href="/products" className="inline-block">
                <Button type="button" variant="primary" className="px-6 py-3">
                  <Icon name="grid_view" className="text-lg" />
                  <span>Explore Catalog</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/25 shadow-[0_6px_20px_rgba(27,42,74,0.04)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-outline-variant/25">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                        <Icon name="receipt_long" />
                      </div>
                      <div>
                        <span className="font-headline-sm text-base text-on-surface font-mono font-bold">
                          {order.orderNumber}
                        </span>
                        <span className="block text-body-sm text-on-surface-variant">
                          {new Date(order.createdAt).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            },
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="inStock">{order.status}</Badge>
                      <span className="font-headline-md text-lg text-primary font-mono font-bold">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  <div className="py-3 space-y-2">
                    {order.items.map((item) => {
                      const title =
                        typeof item.productName === 'string'
                          ? item.productName
                          : item.productName?.en || 'Creation';
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-body-sm"
                        >
                          <span className="text-on-surface">
                            <strong>{item.quantity}x</strong> {title} (
                            {item.sizePack})
                          </span>
                          <span className="font-mono font-semibold text-on-surface">
                            ₹{item.subtotal}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-outline-variant/20 flex justify-end">
                    <a
                      href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                        `Namaste! Following up on my Order ${order.orderNumber}.`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-label-sm font-bold text-tertiary hover:underline"
                    >
                      <Icon name="chat" className="text-base" />
                      <span>Message Concierge on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};
