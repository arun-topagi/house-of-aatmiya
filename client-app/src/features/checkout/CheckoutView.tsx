/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header, AdvisoryStrip, BottomNav, Footer } from '@/components';
import { Badge, Button, Icon } from '@/elements';
import {
  FALLBACK_PRODUCTS,
  orderService,
  userAuthService,
} from '@/services';
import {
  addToCart,
  clearCart,
  removeFromCart,
  setGiftNote,
  setUserCredentials,
  syncUserProfile,
  updateQuantity,
  updateSavedAddress,
  useAppDispatch,
  useAppSelector,
} from '@/store';

type CheckoutStage = 1 | 2 | 3 | 4;

export const CheckoutView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: cartItems, giftNote } = useAppSelector((s) => s.cart);
  const { isAuthenticated, user, address, accessToken } = useAppSelector(
    (s) => s.userAuth,
  );

  const [stage, setStage] = useState<CheckoutStage>(1);

  // Stage 2: WhatsApp OTP State
  const [phoneInput, setPhoneInput] = useState(user.phone || '');
  const [customerName, setCustomerName] = useState(user.name || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Stage 3: Address + GPS Location State
  const [flatOrHouse, setFlatOrHouse] = useState(address.flatOrHouse || '');
  const [areaOrSociety, setAreaOrSociety] = useState(
    address.areaOrSociety || '',
  );
  const [city, setCity] = useState(address.city || 'Pune');
  const [stateName, setStateName] = useState(address.state || 'Maharashtra');
  const [pincode, setPincode] = useState(address.pincode || '');
  const [landmark, setLandmark] = useState(address.landmark || '');
  const [isSocietyResident, setIsSocietyResident] = useState(
    address.isSocietyResident ?? true,
  );
  const [latitude, setLatitude] = useState<number | null>(address.latitude);
  const [longitude, setLongitude] = useState<number | null>(address.longitude);
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    address.googleMapsUrl || '',
  );
  const [isMobileConfirmed, setIsMobileConfirmed] = useState(
    address.isMobileConfirmed || false,
  );
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Sync local form fields when userAuth hydrates from localStorage
  React.useEffect(() => {
    if (user.phone) setPhoneInput((prev) => prev || user.phone);
    if (user.name) setCustomerName((prev) => prev || user.name);
    if (address.flatOrHouse)
      setFlatOrHouse((prev) => prev || address.flatOrHouse);
    if (address.areaOrSociety)
      setAreaOrSociety((prev) => prev || address.areaOrSociety);
    if (address.city) setCity((prev) => prev || address.city);
    if (address.state) setStateName((prev) => prev || address.state);
    if (address.pincode) setPincode((prev) => prev || address.pincode);
    if (address.landmark) setLandmark((prev) => prev || address.landmark);
    setIsSocietyResident(address.isSocietyResident ?? true);
    if (address.latitude !== null) setLatitude(address.latitude);
    if (address.longitude !== null) setLongitude(address.longitude);
    if (address.googleMapsUrl)
      setGoogleMapsUrl((prev) => prev || address.googleMapsUrl);
    if (address.isMobileConfirmed) setIsMobileConfirmed(true);
  }, [user, address]);

  // Fetch latest user details via guarded GET /user-auth/profile when authenticated
  React.useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    userAuthService
      .getProfile()
      .then((res) => {
        if (res?.user) {
          dispatch(
            syncUserProfile({
              user: res.user,
              address: res.address || undefined,
            }),
          );
          if (res.user.name) setCustomerName(res.user.name);
          if (res.user.phone) setPhoneInput(res.user.phone);
        }
        if (res?.address) {
          if (res.address.flatOrHouse) setFlatOrHouse(res.address.flatOrHouse);
          if (res.address.areaOrSociety)
            setAreaOrSociety(res.address.areaOrSociety);
          if (res.address.city) setCity(res.address.city);
          if (res.address.state) setStateName(res.address.state);
          if (res.address.pincode) setPincode(res.address.pincode);
          if (res.address.landmark !== undefined)
            setLandmark(res.address.landmark || '');
          setIsSocietyResident(Boolean(res.address.isSocietyResident));
          if (res.address.latitude !== null) setLatitude(res.address.latitude);
          if (res.address.longitude !== null)
            setLongitude(res.address.longitude);
          if (res.address.googleMapsUrl)
            setGoogleMapsUrl(res.address.googleMapsUrl);
        }
      })
      .catch(() => {
        // Handled by HttpFactory 401 interceptor if session expired
      });
  }, [isAuthenticated, accessToken, dispatch]);

  // Stage 4: Order Submission State
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    totalAmount: number;
    whatsappConciergeUrl: string;
  } | null>(null);

  const subtotal = cartItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );
  const shippingFee = isSocietyResident || subtotal >= 1500 ? 0 : 90;
  const totalPayable = subtotal + shippingFee;

  const hasSavedAddress = Boolean(
    (flatOrHouse || address.flatOrHouse)?.trim() &&
      (areaOrSociety || address.areaOrSociety)?.trim() &&
      (city || address.city)?.trim() &&
      /^\d{6}$/.test((pincode || address.pincode || '').trim()),
  );

  // Dynamic Stepper: hides Stage 2 (OTP) & Stage 3 (Address) when already verified & saved
  const visibleSteps = [
    { id: 1 as CheckoutStage, label: 'Review Bag', icon: 'shopping_bag' },
    ...(!isAuthenticated
      ? [{ id: 2 as CheckoutStage, label: 'WhatsApp OTP', icon: 'chat' }]
      : []),
    ...(!isAuthenticated || !hasSavedAddress || stage === 3
      ? [
          {
            id: 3 as CheckoutStage,
            label: 'GPS & Address',
            icon: 'my_location',
          },
        ]
      : []),
    { id: 4 as CheckoutStage, label: 'Place Order', icon: 'verified' },
  ];

  const handleLoadSampleItems = () => {
    const snack = FALLBACK_PRODUCTS[0];
    const dress = FALLBACK_PRODUCTS[4];
    dispatch(
      addToCart({
        productId: snack.id,
        variantId: snack.variants[0].id,
        sku: snack.sku,
        productName: snack.name.en,
        categorySlug: snack.category.slug,
        sizePack: snack.variants[0].sizePack,
        unitPrice: snack.variants[0].price,
        quantity: 1,
        imageUrl: snack.imageUrl,
        isMadeToBatch: true,
      }),
    );
    dispatch(
      addToCart({
        productId: dress.id,
        variantId: dress.variants[1].id,
        sku: dress.sku,
        productName: dress.name.en,
        categorySlug: dress.category.slug,
        sizePack: dress.variants[1].sizePack,
        unitPrice: dress.variants[1].price,
        quantity: 1,
        imageUrl: dress.imageUrl,
        isMadeToBatch: false,
      }),
    );
  };

  // --- STAGE 2: WHATSAPP OTP HANDLERS ---
  const handleSendWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleaned = phoneInput.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setAuthError(
        'Please enter a valid 10-digit Indian WhatsApp mobile number.',
      );
      return;
    }

    setAuthLoading(true);
    try {
      const payload = await userAuthService.sendOtp(cleaned);
      setOtpSent(true);
      if (payload?.devOtp) {
        setDevOtpHint(payload.devOtp);
        setOtpCode(payload.devOtp);
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not send WhatsApp OTP. Please check your connection and try again.';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleaned = phoneInput.replace(/\D/g, '').slice(-10);
    if (otpCode.trim().length < 4) {
      setAuthError('Please enter the 4-digit WhatsApp OTP.');
      return;
    }

    setAuthLoading(true);
    try {
      const payload = await userAuthService.verifyOtp({
        phone: cleaned,
        otp: otpCode.trim(),
        name: customerName.trim() || 'Aatmiya Guest',
      });
      dispatch(
        setUserCredentials({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
          address: payload.address || undefined,
        }),
      );
      if (payload.address) {
        setFlatOrHouse(payload.address.flatOrHouse || '');
        setAreaOrSociety(payload.address.areaOrSociety || '');
        setCity(payload.address.city || 'Pune');
        setPincode(payload.address.pincode || '');
        setLandmark(payload.address.landmark || '');
        setIsSocietyResident(Boolean(payload.address.isSocietyResident));
        setLatitude(payload.address.latitude);
        setLongitude(payload.address.longitude);
        setGoogleMapsUrl(payload.address.googleMapsUrl || '');
      }

      const returnedAddrValid = Boolean(
        (payload.address?.flatOrHouse || flatOrHouse)?.trim() &&
          (payload.address?.areaOrSociety || areaOrSociety)?.trim() &&
          (payload.address?.pincode || pincode)?.trim(),
      );

      setStage(returnedAddrValid ? 4 : 3);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Invalid OTP code. Please check WhatsApp and try again.';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  // --- STAGE 3: GPS LOCATION + REVERSE GEOCODING ---
  const handleDetectGpsLocation = () => {
    setAddressError(null);
    if (!('geolocation' in navigator)) {
      setAddressError('Geolocation is not supported by this browser.');
      return;
    }

    setGpsStatus('Detecting your exact mobile GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
        setLatitude(lat);
        setLongitude(lng);
        setGoogleMapsUrl(mapsLink);
        setIsMobileConfirmed(true);

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          const geoData = await geoRes.json();
          const addr = geoData?.address || {};
          if (addr.suburb || addr.neighbourhood || addr.residential) {
            setAreaOrSociety(
              addr.suburb || addr.neighbourhood || addr.residential,
            );
          }
          if (addr.city || addr.town || addr.state_district) {
            setCity(addr.city || addr.town || addr.state_district);
          }
          if (addr.state) {
            setStateName(addr.state);
          }
          if (addr.postcode) {
            setPincode(String(addr.postcode).replace(/\D/g, '').slice(0, 6));
          }
          setGpsStatus(
            `GPS Location Locked (${lat}, ${lng}) & Address Auto-Filled!`,
          );
        } catch {
          setGpsStatus(`GPS Coordinates Locked (${lat}, ${lng})!`);
        }
      },
      () => {
        setGpsStatus(null);
        setAddressError(
          'Unable to fetch GPS automatically. Please allow location access or enter your address below.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSaveAddressAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);

    if (!customerName.trim() || !flatOrHouse.trim() || !areaOrSociety.trim()) {
      setAddressError(
        'Please enter your Name, Flat/House No., and Housing Society/Area.',
      );
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setAddressError('Please enter a valid 6-digit Pincode.');
      return;
    }

    const updatedAddr = {
      fullName: customerName.trim(),
      flatOrHouse: flatOrHouse.trim(),
      areaOrSociety: areaOrSociety.trim(),
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
      landmark: landmark.trim(),
      isSocietyResident,
      latitude,
      longitude,
      googleMapsUrl,
      isMobileConfirmed,
    };

    dispatch(updateSavedAddress(updatedAddr));

    if (isAuthenticated && accessToken) {
      try {
        await userAuthService.updateAddress({
          name: updatedAddr.fullName,
          flatOrHouse: updatedAddr.flatOrHouse,
          areaOrSociety: updatedAddr.areaOrSociety,
          city: updatedAddr.city,
          state: updatedAddr.state,
          pincode: updatedAddr.pincode,
          landmark: updatedAddr.landmark,
          isSocietyResident: updatedAddr.isSocietyResident,
          latitude: updatedAddr.latitude ?? undefined,
          longitude: updatedAddr.longitude ?? undefined,
          googleMapsUrl: updatedAddr.googleMapsUrl || undefined,
          isMobileConfirmed: updatedAddr.isMobileConfirmed,
        });
      } catch {
        // Proceed smoothly
      }
    }

    setStage(4);
  };

  // --- STAGE 4: PLACE ORDER & OPEN WHATSAPP ---
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setOrderError(null);

    if (!isAuthenticated || !accessToken) {
      setStage(2);
      setAuthError(
        'Please verify your WhatsApp number via OTP before placing your order.',
      );
      return;
    }

    setPlacingOrder(true);

    const effectivePhone = (user.phone || phoneInput)
      .replace(/\D/g, '')
      .slice(-10);

    try {
      const orderData = await orderService.createOrder({
        items: cartItems.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        address: {
          fullName: customerName.trim() || user.name || 'Aatmiya Guest',
          phone: effectivePhone,
          flatOrHouse: flatOrHouse.trim(),
          areaOrSociety: areaOrSociety.trim(),
          city: city.trim(),
          state: stateName.trim(),
          pincode: pincode.trim(),
          landmark: landmark.trim(),
          isSocietyResident,
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
          googleMapsUrl: googleMapsUrl || undefined,
          isMobileConfirmed,
        },
        giftNote: giftNote.trim() || undefined,
      });

      dispatch(clearCart());
      setConfirmedOrder({
        orderNumber: orderData.orderNumber,
        totalAmount: orderData.totalAmount,
        whatsappConciergeUrl: orderData.whatsappConciergeUrl,
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to place order. Please check your login session and try again.';
      setOrderError(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const mobileConfirmDeepLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/confirm-address?phone=${encodeURIComponent(
          user.phone || phoneInput,
        )}&flat=${encodeURIComponent(flatOrHouse)}&society=${encodeURIComponent(
          areaOrSociety,
        )}&city=${encodeURIComponent(city)}&pincode=${encodeURIComponent(pincode)}`
      : '/confirm-address';

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 pt-16 sm:pt-20 pb-28">
        <AdvisoryStrip />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
                <span className="text-primary font-bold">Checkout</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                Verified WhatsApp &amp; GPS Checkout
              </h1>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-label-md font-label-md text-primary hover:underline"
            >
              <Icon name="arrow_back" className="text-base" />
              <span>Continue Browsing</span>
            </Link>
          </div>

          {/* Dynamic Checkout Stepper */}
          {!confirmedOrder && (
            <div className="w-full cred-card rounded-2xl p-4 sm:p-5 mb-6">
              <div
                className={`grid gap-2 ${
                  visibleSteps.length === 2
                    ? 'grid-cols-2'
                    : visibleSteps.length === 3
                      ? 'grid-cols-3'
                      : 'grid-cols-4'
                }`}
              >
                {visibleSteps.map((s, idx) => {
                  const isActive = stage === s.id;
                  const isCompleted = stage > s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (s.id < stage) setStage(s.id);
                      }}
                      className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]'
                          : isCompleted
                            ? 'bg-tertiary-fixed/70 border border-tertiary/25 text-on-tertiary-fixed hover:bg-tertiary-fixed'
                            : 'bg-[#090a0f] border border-white/[0.06] text-on-surface-variant'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-[#090a0f]/15 text-[#090a0f]'
                            : isCompleted
                              ? 'bg-tertiary text-on-tertiary'
                              : 'bg-[#141722] text-on-surface-variant'
                        }`}
                      >
                        <Icon
                          name={isCompleted ? 'check' : s.icon}
                          className="text-lg"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8.5px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.04em] sm:tracking-wider block opacity-80 whitespace-nowrap">
                          Step {idx + 1}
                        </span>
                        <span className="font-label-md text-[11px] sm:text-label-md whitespace-nowrap block">
                          {s.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CONFIRMED ORDER VIEW */}
          {confirmedOrder ? (
            <div className="cred-card rounded-3xl p-6 sm:p-10 text-center space-y-5 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-tertiary-fixed border border-tertiary/30 text-on-tertiary-fixed mx-auto flex items-center justify-center">
                <Icon name="check_circle" className="text-4xl" filled />
              </div>
              <Badge variant="secondaryContainer" className="mx-auto mb-0">
                Order Reference #{confirmedOrder.orderNumber}
              </Badge>
              <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface">
                Thank You! Your Order Has Been Registered.
              </h2>
              <p className="text-body-md text-on-surface-variant max-w-xl mx-auto">
                Click below to send your formatted order summary and GPS pin to{' '}
                <strong>Aatmiya WhatsApp Concierge</strong>. Our team will call
                you shortly to confirm your adult dress/kurta sizes or fresh
                food batch and share the UPI payment request.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={confirmedOrder.whatsappConciergeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/35 hover:bg-[#25D366]/25 text-[#4ade80] font-label-lg text-label-lg transition-all active:scale-[0.98] flex items-center gap-2"
                >
                  <Icon name="chat" className="text-xl" />
                  <span>
                    Send Order #{confirmedOrder.orderNumber} on WhatsApp
                  </span>
                </a>
                <Link
                  href="/orders"
                  className="px-5 py-3.5 rounded-xl bg-[#090a0f] hover:bg-[#141722] border border-white/[0.1] font-label-md text-label-md text-on-surface flex items-center gap-1.5"
                >
                  <Icon name="receipt_long" className="text-lg text-primary" />
                  <span>View My Orders</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 8 Columns: Active Checkout Stage */}
              <div className="lg:col-span-8">
                {/* STAGE 1: CART REVIEW */}
                {stage === 1 && (
                  <div className="cred-card rounded-3xl p-5 sm:p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                      <div className="flex items-center gap-2.5">
                        <Icon
                          name="shopping_bag"
                          className="text-primary text-2xl"
                        />
                        <h2 className="font-headline-md text-headline-md text-on-surface">
                          Your Selected Curations
                        </h2>
                      </div>
                      <span className="text-label-sm text-on-surface-variant">
                        {cartItems.length}{' '}
                        {cartItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="py-10 text-center space-y-4">
                        <Icon
                          name="shopping_bag"
                          className="text-5xl text-outline block mx-auto"
                        />
                        <p className="text-body-md text-on-surface-variant">
                          Your bag is currently empty.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                          <Button
                            type="button"
                            onClick={handleLoadSampleItems}
                            variant="primary"
                          >
                            <Icon name="auto_awesome" className="text-base" />
                            <span>
                              Load Sample Bag (1 Kids&apos; Snack + 1 Adult
                              Cotton Dress)
                            </span>
                          </Button>
                          <Link
                            href="/products"
                            className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md border border-outline-variant/30"
                          >
                            Browse Catalog
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="divide-y divide-white/[0.08]">
                          {cartItems.map((item) => (
                            <div
                              key={item.variantId}
                              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="w-16 h-16 rounded-xl object-cover border border-white/[0.08] shrink-0"
                                />
                                <div>
                                  <h4 className="font-headline-sm text-base text-on-surface">
                                    {item.productName}
                                  </h4>
                                  <p className="text-body-sm text-on-surface-variant mt-0.5">
                                    Option: <strong>{item.sizePack}</strong> • ₹
                                    {item.unitPrice} each
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3">
                                <div className="flex items-center bg-[#090a0f] rounded-lg p-0.5 border border-white/[0.08]">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      dispatch(
                                        updateQuantity({
                                          variantId: item.variantId,
                                          quantity: item.quantity - 1,
                                        }),
                                      )
                                    }
                                    className="w-8 h-8 rounded-md hover:bg-primary/15 text-primary flex items-center justify-center cursor-pointer"
                                  >
                                    <Icon name="remove" className="text-base" />
                                  </button>
                                  <span className="w-8 text-center font-mono font-bold text-sm">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      dispatch(
                                        updateQuantity({
                                          variantId: item.variantId,
                                          quantity: item.quantity + 1,
                                        }),
                                      )
                                    }
                                    className="w-8 h-8 rounded-md hover:bg-primary/15 text-primary flex items-center justify-center cursor-pointer"
                                  >
                                    <Icon name="add" className="text-base" />
                                  </button>
                                </div>

                                <span className="font-headline-sm text-base font-mono font-bold text-on-surface w-16 text-right">
                                  ₹{item.unitPrice * item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    dispatch(removeFromCart(item.variantId))
                                  }
                                  className="p-1.5 text-error hover:bg-error-container/40 rounded-lg cursor-pointer"
                                  title="Remove item"
                                >
                                  <Icon name="delete" className="text-lg" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2">
                          <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
                            Optional Family / Festive Gift Note
                          </label>
                          <input
                            type="text"
                            value={giftNote}
                            onChange={(e) =>
                              dispatch(setGiftNote(e.target.value))
                            }
                            placeholder="e.g., Warm Diwali wishes from our family to yours!"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-md focus:outline-none focus:border-primary/50"
                          />
                        </div>

                        <div className="pt-4 border-t border-white/[0.08] flex justify-end">
                          <Button
                            type="button"
                            onClick={() => {
                              if (!isAuthenticated) {
                                setStage(2);
                              } else if (!hasSavedAddress) {
                                setStage(3);
                              } else {
                                setStage(4);
                              }
                            }}
                            variant="primary"
                            className="px-6 py-3 text-sm"
                          >
                            <span>
                              {!isAuthenticated
                                ? 'Continue to WhatsApp OTP Login'
                                : !hasSavedAddress
                                  ? 'Continue to GPS & Address'
                                  : 'Proceed to Place Order (OTP & Address Verified)'}
                            </span>
                            <Icon name="arrow_forward" className="text-base" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* STAGE 2: WHATSAPP OTP VERIFICATION */}
                {stage === 2 && (
                  <div className="cred-card rounded-3xl p-6 sm:p-8 space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-tertiary-fixed border border-tertiary/25 text-on-tertiary-fixed flex items-center justify-center shrink-0">
                        <Icon name="chat" className="text-2xl" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-tertiary uppercase tracking-[0.18em] font-bold">
                          Meta WhatsApp Cloud API Verification
                        </span>
                        <h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">
                          Verify Your WhatsApp Mobile Number
                        </h2>
                        <p className="text-body-sm text-on-surface-variant mt-1">
                          We send a 4-digit OTP directly to your WhatsApp so our
                          concierge can reach you for personal size &amp; batch
                          confirmation.
                        </p>
                      </div>
                    </div>

                    {authError && (
                      <div className="p-3.5 rounded-xl bg-error-container border border-red-400/25 text-on-error-container text-body-sm font-medium flex items-center gap-2">
                        <Icon name="error" className="text-lg" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {!otpSent ? (
                      <form
                        onSubmit={handleSendWhatsAppOtp}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
                            Your Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g., Priya Kulkarni"
                            className="w-full px-4 py-3 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-md focus:outline-none focus:border-primary/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
                            10-Digit WhatsApp Mobile Number
                          </label>
                          <div className="flex items-center rounded-xl bg-[#090a0f] border border-white/[0.08] px-4 py-3 focus-within:border-primary/50">
                            <span className="font-mono font-bold text-primary pr-3 border-r border-white/[0.08]">
                              +91
                            </span>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              value={phoneInput}
                              onChange={(e) =>
                                setPhoneInput(e.target.value.replace(/\D/g, ''))
                              }
                              placeholder="9876543210"
                              className="w-full pl-3 bg-transparent text-on-surface placeholder:text-on-surface-variant/50 font-mono text-base font-bold focus:outline-none"
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          disabled={authLoading}
                          variant="primary"
                          className="w-full py-3.5 text-base"
                        >
                          <Icon name="send" className="text-lg" />
                          <span>
                            {authLoading
                              ? 'Sending WhatsApp OTP...'
                              : 'Send 4-Digit OTP on WhatsApp'}
                          </span>
                        </Button>
                      </form>
                    ) : (
                      <form
                        onSubmit={handleVerifyWhatsAppOtp}
                        className="space-y-4"
                      >
                        <div className="p-3.5 rounded-xl bg-tertiary-fixed/70 border border-tertiary/25 text-body-sm text-on-tertiary-fixed flex flex-wrap items-center justify-between gap-2">
                          <span>
                            4-Digit OTP sent to WhatsApp{' '}
                            <strong>+91 {phoneInput}</strong>
                          </span>
                          {devOtpHint && (
                            <span className="px-2.5 py-0.5 rounded-md bg-[#090a0f] border border-white/[0.1] text-primary font-mono font-bold text-xs">
                              Dev OTP: {devOtpHint}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
                            Enter 4-Digit WhatsApp OTP
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            required
                            value={otpCode}
                            onChange={(e) =>
                              setOtpCode(e.target.value.replace(/\D/g, ''))
                            }
                            placeholder="••••"
                            className="w-full px-4 py-3.5 rounded-xl bg-[#090a0f] border-2 border-primary text-on-surface text-center text-2xl font-mono font-bold tracking-[0.5em] focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="px-4 py-3 rounded-xl bg-[#090a0f] border border-white/[0.1] font-label-md text-label-md text-on-surface-variant hover:text-on-surface cursor-pointer"
                          >
                            Change Number
                          </button>
                          <Button
                            type="submit"
                            disabled={authLoading}
                            variant="primary"
                            className="flex-1 py-3.5 text-base"
                          >
                            <Icon name="verified" className="text-lg" />
                            <span>
                              {authLoading
                                ? 'Verifying...'
                                : 'Verify OTP & Continue'}
                            </span>
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* STAGE 3: GPS LOCATION & MOBILE ADDRESS CONFIRMATION */}
                {stage === 3 && (
                  <div className="cred-card rounded-3xl p-6 sm:p-8 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-tertiary flex items-center gap-1">
                          <Icon name="verified_user" className="text-sm" />
                          <span>
                            Verified WhatsApp: +91 {user.phone || phoneInput}
                          </span>
                        </span>
                        <h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">
                          Delivery Address &amp; Exact GPS Pin
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={handleDetectGpsLocation}
                        className="px-4 py-2.5 rounded-xl bg-tertiary text-on-tertiary font-label-md text-label-md font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] cursor-pointer flex items-center gap-1.5 self-start hover:brightness-105 active:scale-[0.98] transition-all"
                      >
                        <Icon name="my_location" className="text-lg" />
                        <span>Detect My GPS Location</span>
                      </button>
                    </div>

                    {gpsStatus && (
                      <div className="p-3.5 rounded-xl bg-tertiary-fixed/70 border border-tertiary/25 text-body-sm text-on-tertiary-fixed flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Icon name="check_circle" className="text-base" />
                          <span>{gpsStatus}</span>
                        </span>
                        {googleMapsUrl && (
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-bold"
                          >
                            View Pin on Google Maps ↗
                          </a>
                        )}
                      </div>
                    )}

                    {addressError && (
                      <div className="p-3.5 rounded-xl bg-error-container border border-red-400/25 text-on-error-container text-body-sm font-medium">
                        {addressError}
                      </div>
                    )}

                    <form
                      onSubmit={handleSaveAddressAndContinue}
                      className="space-y-4"
                    >
                      {/* Housing Society Resident Toggle */}
                      <label className="p-4 rounded-xl bg-[#090a0f] border border-white/[0.08] flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Icon
                            name="apartment"
                            className="text-primary text-2xl"
                          />
                          <div>
                            <div className="font-label-md text-label-md text-on-surface">
                              Are you in our Housing Society / First Circle?
                            </div>
                            <div className="text-body-sm text-on-surface-variant">
                              Enables FREE doorstep hand-delivery &amp;
                              priority batch drop
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSocietyResident}
                          onChange={(e) =>
                            setIsSocietyResident(e.target.checked)
                          }
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
                            Recipient Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface text-body-md focus:outline-none focus:border-primary/50"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
                            Flat / Tower / House No. *
                          </label>
                          <input
                            type="text"
                            required
                            value={flatOrHouse}
                            onChange={(e) => setFlatOrHouse(e.target.value)}
                            placeholder="e.g., Tower B - Flat 402"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-md focus:outline-none focus:border-primary/50"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
                            Housing Society / Street / Area *
                          </label>
                          <input
                            type="text"
                            required
                            value={areaOrSociety}
                            onChange={(e) => setAreaOrSociety(e.target.value)}
                            placeholder="e.g., Kalpataru Harmony Society, Wakad"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-md focus:outline-none focus:border-primary/50"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
                            Landmark
                          </label>
                          <input
                            type="text"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            placeholder="e.g., Near Clubhouse Gate"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-md focus:outline-none focus:border-primary/50"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface text-body-md focus:outline-none focus:border-primary/50"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">
                            6-Digit Pincode *
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            required
                            value={pincode}
                            onChange={(e) =>
                              setPincode(e.target.value.replace(/\D/g, ''))
                            }
                            placeholder="411057"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 font-mono text-body-md focus:outline-none focus:border-primary/50"
                          />
                        </div>
                      </div>

                      {/* Mobile Address Confirmation Card */}
                      <div className="p-4 rounded-xl bg-[#090a0f] border border-white/[0.08] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
                            <Icon
                              name="smartphone"
                              className="text-primary text-lg"
                            />
                            <span>Confirm Address &amp; GPS Pin from Mobile</span>
                          </span>
                          <Badge
                            variant={
                              isMobileConfirmed ? 'inStock' : 'sizePack'
                            }
                          >
                            {isMobileConfirmed
                              ? 'GPS & Mobile Confirmed'
                              : 'Optional Mobile Link'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          <label className="inline-flex items-center gap-2 text-body-sm font-medium text-on-surface cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isMobileConfirmed}
                              onChange={(e) =>
                                setIsMobileConfirmed(e.target.checked)
                              }
                              className="w-4 h-4 accent-tertiary"
                            />
                            <span>
                              I confirm this delivery address &amp; GPS pin
                            </span>
                          </label>

                          <a
                            href={`https://wa.me/91${(
                              user.phone ||
                              phoneInput ||
                              ''
                            )
                              .replace(/\D/g, '')
                              .slice(-10)}?text=${encodeURIComponent(
                              `Tap this link on your mobile to confirm your GPS delivery pin for The House of Aatmiya: ${mobileConfirmDeepLink}`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-label-sm font-bold text-secondary underline"
                          >
                            Send Mobile GPS Confirm Link to My WhatsApp ↗
                          </a>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setStage(1)}
                          className="text-label-md text-on-surface-variant hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Icon name="arrow_back" className="text-base" />
                          <span>Back</span>
                        </button>
                        <Button
                          type="submit"
                          variant="primary"
                          className="px-6 py-3"
                        >
                          <span>Save Address &amp; Review Order</span>
                          <Icon name="arrow_forward" className="text-base" />
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* STAGE 4: FINAL CONFIRMATION & WHATSAPP CONCIERGE DISPATCH */}
                {stage === 4 && (
                  <div className="cred-card rounded-3xl p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
                      <Icon
                        name="verified"
                        className="text-tertiary text-2xl"
                        filled
                      />
                      <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">
                          Confirm &amp; Send Order on WhatsApp
                        </h2>
                        <p className="text-body-sm text-on-surface-variant">
                          Your WhatsApp number and delivery address are verified
                        </p>
                      </div>
                    </div>

                    {orderError && (
                      <div className="p-3.5 rounded-xl bg-error-container border border-red-400/25 text-on-error-container text-body-sm font-medium flex items-center gap-2">
                        <Icon name="error" className="text-lg" />
                        <span>{orderError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#090a0f] border border-white/[0.08] space-y-1.5 text-body-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.16em]">
                            Verified Buyer &amp; Address
                          </span>
                          <button
                            type="button"
                            onClick={() => setStage(3)}
                            className="text-label-sm font-bold text-secondary hover:underline cursor-pointer"
                          >
                            Edit Address / GPS
                          </button>
                        </div>
                        <p className="font-bold text-on-surface">
                          {customerName || user.name} (+91{' '}
                          {user.phone || phoneInput} ✓)
                        </p>
                        <p className="text-on-surface-variant">
                          {flatOrHouse || address.flatOrHouse},{' '}
                          {areaOrSociety || address.areaOrSociety},{' '}
                          {city || address.city} - {pincode || address.pincode}
                        </p>
                        {googleMapsUrl && (
                          <p>
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-tertiary font-bold underline inline-flex items-center gap-1"
                            >
                              <Icon name="my_location" className="text-sm" />
                              <span>
                                GPS Pin Attached ({latitude}, {longitude})
                              </span>
                            </a>
                          </p>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-[#090a0f] border border-white/[0.08] space-y-2 text-body-sm">
                        <div className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.16em]">
                          Personal Confirmation Call &amp; UPI
                        </div>
                        <p className="text-on-surface-variant">
                          • <strong>No COD:</strong> Our concierge will call you
                          to confirm adult garment measurements and fresh food
                          batch timing.
                        </p>
                        <p className="text-on-surface-variant">
                          • <strong>UPI on Call:</strong> 100% UPI advance for
                          Fresh Foods/Hampers, or 50% booking advance for Cotton
                          Clothing.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => setStage(1)}
                        className="text-label-md text-on-surface-variant hover:text-on-surface cursor-pointer flex items-center gap-1"
                      >
                        <Icon name="arrow_back" className="text-base" />
                        <span>Back to Bag</span>
                      </button>

                      <button
                        type="button"
                        disabled={placingOrder}
                        onClick={handlePlaceOrder}
                        className="px-7 py-3.5 rounded-xl bg-gradient-to-b from-[#f0d399] to-[#cfa355] text-[#090a0f] font-bold font-label-lg text-label-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_28px_rgba(229,194,128,0.22)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Icon name="chat" className="text-xl" />
                        <span>
                          {placingOrder
                            ? 'Registering Order...'
                            : 'Place Order & Open WhatsApp Concierge'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right 4 Columns: Sticky Order Summary Sidebar */}
              <div className="lg:col-span-4">
                <aside className="cred-card rounded-3xl p-5 sm:p-6 sticky top-24 space-y-4">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface border-b border-white/[0.08] pb-3">
                    Order Summary
                  </h3>

                  <div className="space-y-2.5 text-body-sm">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Items Subtotal</span>
                      <span className="font-mono font-semibold text-on-surface">
                        ₹{subtotal}
                      </span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>
                        {isSocietyResident
                          ? 'Housing Society Hand-Delivery'
                          : 'Standard Courier'}
                      </span>
                      <span className="font-mono font-semibold text-tertiary">
                        {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-white/[0.08] flex justify-between items-baseline">
                      <span className="font-label-lg text-on-surface">
                        Total Payable
                      </span>
                      <span className="font-headline-md text-2xl font-mono font-bold text-primary">
                        ₹{totalPayable}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-body-sm text-on-surface-variant space-y-1.5">
                    <div className="flex items-center gap-2 text-on-surface font-semibold">
                      <Icon
                        name="verified"
                        className="text-primary text-lg"
                        filled
                      />
                      <span>Crafted Like Family</span>
                    </div>
                    <p className="text-xs">
                      Every order is personally reviewed before roasting or
                      dispatch.
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};
