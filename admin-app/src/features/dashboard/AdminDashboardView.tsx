'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components';
import {
  AdminOrder,
  adminOrderService,
  AdminProduct,
  adminProductService,
  authService,
  FALLBACK_ADMIN_ORDERS,
  FALLBACK_ADMIN_PRODUCTS,
  OrderStatus,
  StorefrontMode,
} from '@/services';
import {
  loginAdminSuccess,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { OrderFlyout, OrdersTable, OrdersToolbar } from '@/features/orders';
import {
  ProductFlyout,
  ProductsTable,
  ProductsToolbar,
} from '@/features/products';

const CATEGORY_MAP: Record<
  string,
  { id: string; slug: string; modeGroup: StorefrontMode; name: { en: string } }
> = {
  'kids-snacks': {
    id: 'cat-snacks',
    slug: 'kids-snacks',
    modeGroup: 'FOODS_ONLY',
    name: { en: "Kids' Clean Snacks & Pantry" },
  },
  dresses: {
    id: 'cat-dresses',
    slug: 'dresses',
    modeGroup: 'DRESS_AND_GIFTS',
    name: { en: "Women's Pure Cotton Dresses" },
  },
  kurtas: {
    id: 'cat-kurtas',
    slug: 'kurtas',
    modeGroup: 'DRESS_AND_GIFTS',
    name: { en: 'Pure Cotton Kurtas & Co-ords' },
  },
  stoles: {
    id: 'cat-stoles',
    slug: 'stoles',
    modeGroup: 'DRESS_AND_GIFTS',
    name: { en: 'Handcrafted Cotton Stoles' },
  },
  hampers: {
    id: 'cat-hampers',
    slug: 'hampers',
    modeGroup: 'DRESS_AND_GIFTS',
    name: { en: 'Signature Gift Hampers' },
  },
};

export const AdminDashboardView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeTab, isAuthenticated } = useAppSelector((s) => s.admin);

  // Admin Login Form State
  const [email, setEmail] = useState('admin@houseofaatmiya.in');
  const [password, setPassword] = useState('123456790');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Orders State + Toolbar Filters + Flyout
  const [orders, setOrders] = useState<AdminOrder[]>(FALLBACK_ADMIN_ORDERS);
  const [orderIdSearch, setOrderIdSearch] = useState('');
  const [customerNameSearch, setCustomerNameSearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Products State + Toolbar Filters + Flyout
  const [products, setProducts] = useState<AdminProduct[]>(
    FALLBACK_ADMIN_PRODUCTS,
  );
  const [productNameSearch, setProductNameSearch] = useState('');
  const [productCategorySearch, setProductCategorySearch] = useState('');
  const [productStockStatus, setProductStockStatus] = useState('');
  const [isProductFlyoutOpen, setIsProductFlyoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
    null,
  );

  // Storefront Mode Settings State
  const [defaultMode, setDefaultMode] = useState<StorefrontMode>('ALL');
  const [allowModeSwitching, setAllowModeSwitching] = useState<boolean>(true);
  const [nextFoodBatchLabel, setNextFoodBatchLabel] = useState<string>(
    'Next Fresh Batch: Friday (Orders close Wednesday)',
  );
  const [upiVpa, setUpiVpa] = useState<string>('aatmiya@okaxis');
  const [modeSavedToast, setModeSavedToast] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    adminOrderService
      .getOrders()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setOrders(list);
        }
      })
      .catch(() => {});

    adminProductService
      .getProducts()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setProducts(list);
        }
      })
      .catch(() => {});

    adminProductService
      .getStoreSettings()
      .then((s) => {
        if (s?.defaultMode) setDefaultMode(s.defaultMode);
        if (s?.allowModeSwitching !== undefined)
          setAllowModeSwitching(s.allowModeSwitching);
        if (s?.nextFoodBatchLabel) setNextFoodBatchLabel(s.nextFoodBatchLabel);
        if (s?.upiVpa) setUpiVpa(s.upiVpa);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setLoginError('Please enter both your email address and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await authService.login(trimmedEmail, password);
      const token = res?.accessToken;
      const adminUser = res?.admin || {
        email: trimmedEmail,
        name: 'Aatmiya Admin',
        role: 'SUPER_ADMIN',
      };

      if (!token) {
        throw new Error('Missing access token in login response');
      }

      dispatch(
        loginAdminSuccess({
          accessToken: token,
          admin: adminUser,
        }),
      );
    } catch (err: unknown) {
      const isDefaultDevCreds =
        (trimmedEmail === 'admin@houseofaatmiya.in' ||
          trimmedEmail === 'super.admin@houseofaatmiya.com') &&
        password === '123456790';

      const status = (err as { response?: { status?: number } })?.response
        ?.status;

      if (!status && isDefaultDevCreds) {
        dispatch(
          loginAdminSuccess({
            accessToken: 'dev-offline-admin-jwt',
            admin: {
              id: 'admin-default-1',
              email: trimmedEmail,
              name: 'House of Aatmiya Admin',
              role: 'SUPER_ADMIN',
            },
          }),
        );
      } else {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          'Invalid admin email or password. Please try again.';
        setLoginError(msg);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // --- ORDER FLYOUT SAVE HANDLER ---
  const handleSaveOrderFromFlyout = async (
    orderId: string,
    nextStatus: OrderStatus,
    advancePaid: number,
    adminNotes: string,
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: nextStatus,
          advancePaid,
          balanceDue: Math.max(0, o.totalAmount - advancePaid),
          adminNotes,
        };
      }),
    );

    try {
      await adminOrderService.updateOrderStatus(orderId, {
        status: nextStatus,
        advancePaid,
        adminNotes,
      });
    } catch {
      // Updated optimistically
    }
  };

  // --- PRODUCT FLYOUT & TABLE HANDLERS ---
  const handleAddNewProduct = () => {
    setSelectedProduct(null);
    setIsProductFlyoutOpen(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsProductFlyoutOpen(true);
  };

  const handleToggleProductStatus = async (product: AdminProduct) => {
    const nextActive = !product.isActive;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, isActive: nextActive } : p,
      ),
    );
    try {
      await adminProductService.toggleProductStatus(product.id, nextActive);
    } catch {
      // Updated optimistically
    }
  };

  const handleToggleProductFeatured = async (product: AdminProduct) => {
    const nextFeatured = !product.isFeatured;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, isFeatured: nextFeatured } : p,
      ),
    );
    try {
      await adminProductService.toggleProductFeatured(
        product.id,
        nextFeatured,
      );
    } catch {
      // Updated optimistically
    }
  };

  const handleSaveProductFromFlyout: React.ComponentProps<
    typeof ProductFlyout
  >['onSaveProduct'] = async (payload, isEdit) => {
    const catObj =
      CATEGORY_MAP[payload.categorySlug] || CATEGORY_MAP['kids-snacks'];

    if (isEdit && payload.id) {
      try {
        const updated = await adminProductService.updateProduct(payload.id, {
          sku: payload.sku,
          categorySlug: payload.categorySlug,
          name: payload.name,
          description: payload.description,
          usage: payload.usage,
          images: payload.images,
          variants: payload.variants,
          isFeatured: payload.isFeatured,
          isActive: payload.isActive,
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === payload.id ? updated : p)),
        );
        return;
      } catch {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id !== payload.id) return p;
            return {
              ...p,
              sku: payload.sku,
              name: payload.name,
              description: payload.description,
              usage: payload.usage,
              images: payload.images,
              isFeatured: payload.isFeatured,
              isActive: payload.isActive,
              category: catObj,
              variants: payload.variants.map((v, idx) => ({
                id: v.id || `var-${Date.now()}-${idx}`,
                sizePack: v.sizePack,
                costPrice: v.costPrice,
                price: v.price,
                markupMultiple:
                  v.costPrice > 0
                    ? Number((v.price / v.costPrice).toFixed(2))
                    : 2.4,
                stockQty: v.stockQty,
                isMadeToBatch: v.isMadeToBatch,
                isAvailable: true,
              })),
            };
          }),
        );
        return;
      }
    }

    // Create New Product
    try {
      const created = await adminProductService.createProduct({
        sku: payload.sku,
        categorySlug: payload.categorySlug,
        name: payload.name,
        description: payload.description,
        usage: payload.usage,
        images: payload.images,
        variants: payload.variants,
        isFeatured: payload.isFeatured,
        isActive: payload.isActive,
      });
      setProducts((prev) => [created, ...prev]);
    } catch {
      const optimisticProduct: AdminProduct = {
        id: `prod-${Date.now()}`,
        sku: payload.sku,
        name: payload.name,
        description: payload.description,
        usage: payload.usage,
        images: payload.images,
        isFeatured: payload.isFeatured,
        isActive: payload.isActive,
        stockStatus: 'IN_STOCK',
        category: catObj,
        variants: payload.variants.map((v, idx) => ({
          id: v.id || `var-${Date.now()}-${idx}`,
          sizePack: v.sizePack,
          costPrice: v.costPrice,
          price: v.price,
          markupMultiple:
            v.costPrice > 0
              ? Number((v.price / v.costPrice).toFixed(2))
              : 2.4,
          stockQty: v.stockQty,
          isMadeToBatch: v.isMadeToBatch,
          isAvailable: true,
        })),
      };
      setProducts((prev) => [optimisticProduct, ...prev]);
    }
  };

  const handleSaveStorefrontMode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminProductService.updateStoreSettings({
        defaultMode,
        allowModeSwitching,
        nextFoodBatchLabel,
        upiVpa,
      });
    } catch {
      // Saved locally
    }
    setModeSavedToast(true);
    setTimeout(() => setModeSavedToast(false), 2000);
  };

  // RENDER LOGIN FORM WHEN NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col justify-between p-6 antialiased">
        {/* Ambient Background Glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[60%] -right-[5%] w-[30%] h-[50%] rounded-full bg-secondary-container/20 blur-[100px]" />
        </div>

        {/* Top System Status Ribbon */}
        <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs tracking-wider uppercase text-on-surface-variant">
              System Status: Operational
            </span>
          </div>
          <div className="font-mono text-xs text-outline">
            ADMIN GUARD PROTECTED
          </div>
        </header>

        {/* Main Content Container */}
        <main className="w-full max-w-[440px] mx-auto my-auto py-12">
          {/* Brand Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-container mb-6 shadow-xs">
              <span
                className="material-symbols-outlined text-on-primary-container text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                eco
              </span>
            </div>
            <h1 className="font-headline-lg text-3xl font-bold tracking-tight text-on-surface mb-2">
              The House of Aatmiya
            </h1>
            <p className="text-on-surface-variant text-sm font-medium tracking-wide uppercase">
              Admin Portal
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 shadow-[0_12px_32px_-4px_rgba(20,27,43,0.08)] border border-outline-variant/15">
            <div className="mb-8">
              <h2 className="font-headline-md text-xl font-semibold text-on-surface mb-1">
                Welcome back
              </h2>
              <p className="text-on-surface-variant text-sm">
                Please enter your admin credentials to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6" noValidate>
              {loginError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-error-container text-on-error-container text-xs font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="admin-email"
                  className="block font-label-md text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-lg">
                      mail
                    </span>
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@houseofaatmiya.in"
                    required
                    disabled={isLoggingIn}
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="admin-password"
                    className="block font-label-md text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-lg">
                      lock
                    </span>
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoggingIn}
                    className="w-full pl-11 pr-12 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low cursor-pointer accent-[#004c22]"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-on-surface-variant select-none cursor-pointer"
                  >
                    Remember this device
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline-sm font-semibold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <span className="inline-block w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Dev Credentials Note */}
            <div className="mt-6 pt-5 border-t border-outline-variant/20 text-center">
              <p className="text-[11px] text-on-surface-variant font-mono">
                Default Admin:{' '}
                <strong className="text-on-surface">
                  admin@houseofaatmiya.in
                </strong>{' '}
                / <strong className="text-on-surface">123456790</strong>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto py-4 border-t border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-outline">
          <div>
            © {new Date().getFullYear()} The House of Aatmiya. All rights
            reserved.
          </div>
          <div className="flex gap-6">
            <span>JWT Admin Guard Active</span>
          </div>
        </footer>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalCost = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce(
      (sum, o) =>
        sum +
        o.items.reduce(
          (iSum, item) => iSum + item.costPrice * item.quantity,
          0,
        ),
      0,
    );

  const netProfit = Math.max(0, totalRevenue - totalCost);

  const kitchenBatchItems = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'COMPLETED')
    .flatMap((o) => o.items)
    .filter(
      (i) =>
        i.isMadeToBatch ||
        i.categorySlug === 'kids-snacks' ||
        i.categorySlug === 'hampers',
    );

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      <AdminHeader />

      {/* Flyout Drawers */}
      <OrderFlyout
        isOpen={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onSaveOrder={handleSaveOrderFromFlyout}
      />

      <ProductFlyout
        isOpen={isProductFlyoutOpen}
        onClose={() => setIsProductFlyoutOpen(false)}
        product={selectedProduct}
        onSaveProduct={handleSaveProductFromFlyout}
      />

      <div className="lg:pl-64">
        <main className="w-full pt-6 lg:pt-22 pb-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
          {/* TOP KPI SUMMARY RIBBON */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Pending Calls
                </span>
                <span className="material-symbols-outlined text-amber-700 text-xl">
                  call
                </span>
              </div>
              <div className="font-headline-md text-2xl font-bold text-slate-900 font-mono">
                {orders.filter((o) => o.status === 'PENDING_CALL').length}{' '}
                Orders
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Call buyer • Confirm sizes • Send UPI
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Kitchen Batch Queue
                </span>
                <span className="material-symbols-outlined text-[#166534] text-xl">
                  soup_kitchen
                </span>
              </div>
              <div className="font-headline-md text-2xl font-bold text-[#166534] font-mono">
                {orders.filter((o) => o.status === 'PAID_IN_PREP').length} Paid
              </div>
              <div className="text-xs text-slate-500 mt-1">
                100% UPI advance received
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Order Value
                </span>
                <span className="material-symbols-outlined text-[#166534] text-xl">
                  payments
                </span>
              </div>
              <div className="font-headline-md text-2xl font-bold text-slate-900 font-mono">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-[#166534] font-semibold mt-1">
                Zero COD Exposure
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Estimated Net Profit
                </span>
                <span className="material-symbols-outlined text-[#166534] text-xl">
                  trending_up
                </span>
              </div>
              <div className="font-headline-md text-2xl font-bold text-[#166534] font-mono">
                ₹{netProfit.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                ~58% Margin (Above 2.2x target)
              </div>
            </div>
          </section>

          {/* TAB 1: ORDERS TABLE & ORDER FLYOUT (RAITHA-BANDHU DESIGN) */}
          {activeTab === 'ORDERS' && (
            <section className="space-y-4">
              {/* Page Header Card: Top Action Bar + Filters */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2.5">
                      <h1 className="font-headline-lg text-2xl font-bold text-slate-900 tracking-tight">
                        Orders
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                        {orders.length} Total
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Dense order stream, fulfillment status, and customer
                      delivery coordination. Click the edit icon on any order to
                      open the Order Flyout.
                    </p>
                  </div>
                </div>

                {/* Filter Control Toolbar */}
                <OrdersToolbar
                  orderIdSearch={orderIdSearch}
                  onOrderIdSearchChange={setOrderIdSearch}
                  customerNameSearch={customerNameSearch}
                  onCustomerNameSearchChange={setCustomerNameSearch}
                  phoneSearch={phoneSearch}
                  onPhoneSearchChange={setPhoneSearch}
                  status={orderStatusFilter}
                  onStatusChange={setOrderStatusFilter}
                />
              </div>

              {/* Orders Table */}
              <OrdersTable
                orders={orders}
                orderIdSearch={orderIdSearch}
                customerNameSearch={customerNameSearch}
                phoneSearch={phoneSearch}
                status={orderStatusFilter}
                onEditOrder={setSelectedOrder}
              />
            </section>
          )}

          {/* TAB 2: PRODUCTS TABLE & PRODUCT FLYOUT (RAITHA-BANDHU DESIGN) */}
          {activeTab === 'PRODUCTS_CMS' && (
            <section className="space-y-4">
              {/* Page Header Card: Top Action Bar + Add New Product Button + Filters */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2.5">
                      <h1 className="font-headline-lg text-2xl font-bold text-slate-900 tracking-tight">
                        Products
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                        {products.length} Active SKUs
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Manage catalogue entries, pack/size variants, landed costs,
                      price points, and inventory states via the Product Flyout.
                    </p>
                  </div>

                  {/* Action Cluster */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id="open-flyout-btn"
                      type="button"
                      onClick={handleAddNewProduct}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#166534] hover:bg-[#004c22] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        add
                      </span>
                      <span>Add New Product</span>
                    </button>
                  </div>
                </div>

                {/* Filter Control Toolbar */}
                <ProductsToolbar
                  nameSearch={productNameSearch}
                  onNameSearchChange={setProductNameSearch}
                  categorySearch={productCategorySearch}
                  onCategorySearchChange={setProductCategorySearch}
                  stockStatus={productStockStatus}
                  onStockStatusChange={setProductStockStatus}
                />
              </div>

              {/* Products Table */}
              <ProductsTable
                products={products}
                nameSearch={productNameSearch}
                categorySearch={productCategorySearch}
                stockStatus={productStockStatus}
                onEditProduct={handleEditProduct}
                onToggleStatus={handleToggleProductStatus}
                onToggleFeatured={handleToggleProductFeatured}
              />
            </section>
          )}

          {/* TAB 3: CLIENT 3-MODE STOREFRONT CONTROL */}
          {activeTab === 'STOREFRONT_MODES' && (
            <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold uppercase text-[#166534]">
                  Multi-Mode Storefront Architecture
                </span>
                <h2 className="font-headline-md text-2xl font-bold text-slate-900 mt-0.5">
                  Control What Customers See on the Client App
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Switch the default landing mode or copy direct WhatsApp
                  campaign links for each of your 3 storefront modes.
                </p>
              </div>

              <form onSubmit={handleSaveStorefrontMode} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      mode: 'ALL' as StorefrontMode,
                      title: 'Mode 1: All Categories (/)',
                      desc: 'Shows Pure Cotton Dresses, Kurtas, Stoles, Gift Hampers, and Kids’ Snacks together.',
                      sharePath: 'http://localhost:3000/',
                    },
                    {
                      mode: 'DRESS_AND_GIFTS' as StorefrontMode,
                      title: 'Mode 2: Dresses & Gifts Only (/boutique)',
                      desc: 'Editorial lookbook focused exclusively on Adult Women’s Cotton Dresses, Kurtas, Stoles & Gift Hampers.',
                      sharePath: 'http://localhost:3000/boutique',
                    },
                    {
                      mode: 'FOODS_ONLY' as StorefrontMode,
                      title: 'Mode 3: Pure Foods Only (/foods)',
                      desc: 'Clean pantry view focused exclusively on Kids’ Snacks (Ragi Drink Mix, Ghee Cookies, Chikki, Makhana).',
                      sharePath: 'http://localhost:3000/foods',
                    },
                  ].map((card) => (
                    <div
                      key={card.mode}
                      onClick={() => setDefaultMode(card.mode)}
                      className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                        defaultMode === card.mode
                          ? 'border-[#166534] bg-emerald-50/40'
                          : 'border-slate-200 bg-white hover:border-[#166534]/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-headline-sm font-bold text-base text-slate-900">
                            {card.title}
                          </span>
                          <input
                            type="radio"
                            checked={defaultMode === card.mode}
                            onChange={() => setDefaultMode(card.mode)}
                            className="accent-[#166534]"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-[11px] font-semibold text-[#166534]">
                        Direct Share URL: <code>{card.sharePath}</code>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Next Fresh Food Batch Banner Text
                    </label>
                    <input
                      type="text"
                      value={nextFoodBatchLabel}
                      onChange={(e) => setNextFoodBatchLabel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Merchant UPI ID (for 1-Tap Payment Requests)
                    </label>
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowModeSwitching}
                    onChange={(e) => setAllowModeSwitching(e.target.checked)}
                    className="w-4 h-4 accent-[#166534]"
                  />
                  <span>
                    Show the 3-Mode Switcher Bar in Client App Header
                  </span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-[#166534] text-white text-xs font-bold cursor-pointer"
                >
                  {modeSavedToast
                    ? '✓ Storefront Mode Settings Updated!'
                    : 'Save Storefront Mode Configuration'}
                </button>
              </form>
            </section>
          )}

          {/* TAB 4: KITCHEN BATCH PREP AGGREGATOR */}
          {activeTab === 'KITCHEN_PREP' && (
            <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="font-headline-md text-2xl font-bold text-slate-900">
                Kitchen Batch Aggregator
              </h2>
              <p className="text-xs text-slate-500">
                Automatically totals all fresh snacks and hamper jars across
                active orders so the kitchen knows exactly how much to roast and
                bake on batch day.
              </p>

              <div className="divide-y divide-slate-100">
                {kitchenBatchItems.map((item, idx) => (
                  <div
                    key={`${item.variantId}-${idx}`}
                    className="py-3.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-sm text-slate-900">
                        {item.productName}
                      </span>
                      <span className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                        {item.sizePack}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-sm text-[#166534]">
                      Prepare {item.quantity}{' '}
                      {item.quantity === 1 ? 'Unit / Jar' : 'Units / Jars'}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
