'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header, AdvisoryStrip, BottomNav, Footer } from '@/components';
import { Badge, Button, Icon } from '@/elements';
import { userAuthService } from '@/services';
import {
  logoutUser,
  setUserCredentials,
  syncUserProfile,
  updateSavedAddress,
  useAppDispatch,
  useAppSelector,
} from '@/store';

export const ProfileView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isHydrated, isAuthenticated, user, address, accessToken } =
    useAppSelector((s) => s.userAuth);

  // WhatsApp OTP Login state
  const [phoneInput, setPhoneInput] = useState(user.phone || '');
  const [nameInput, setNameInput] = useState(user.name || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Address Form state
  const [flatOrHouse, setFlatOrHouse] = useState(address.flatOrHouse || '');
  const [areaOrSociety, setAreaOrSociety] = useState(
    address.areaOrSociety || '',
  );
  const [city, setCity] = useState(address.city || 'Pune');
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
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  React.useEffect(() => {
    if (user.phone) setPhoneInput((prev) => prev || user.phone);
    if (user.name) setNameInput((prev) => prev || user.name);
    if (address.flatOrHouse)
      setFlatOrHouse((prev) => prev || address.flatOrHouse);
    if (address.areaOrSociety)
      setAreaOrSociety((prev) => prev || address.areaOrSociety);
    if (address.city) setCity((prev) => prev || address.city);
    if (address.pincode) setPincode((prev) => prev || address.pincode);
    if (address.landmark) setLandmark((prev) => prev || address.landmark);
    setIsSocietyResident(address.isSocietyResident ?? true);
    if (address.latitude !== null) setLatitude(address.latitude);
    if (address.longitude !== null) setLongitude(address.longitude);
    if (address.googleMapsUrl)
      setGoogleMapsUrl((prev) => prev || address.googleMapsUrl);
  }, [user, address]);

  // Fetch authenticated user details from guarded GET /user-auth/profile
  React.useEffect(() => {
    if (!isHydrated || !isAuthenticated || !accessToken) return;
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
          if (res.user.name) setNameInput(res.user.name);
          if (res.user.phone) setPhoneInput(res.user.phone);
        }
        if (res?.address) {
          setFlatOrHouse(res.address.flatOrHouse || '');
          setAreaOrSociety(res.address.areaOrSociety || '');
          setCity(res.address.city || 'Pune');
          setPincode(res.address.pincode || '');
          setLandmark(res.address.landmark || '');
          setIsSocietyResident(Boolean(res.address.isSocietyResident));
          setLatitude(res.address.latitude);
          setLongitude(res.address.longitude);
          setGoogleMapsUrl(res.address.googleMapsUrl || '');
        }
      })
      .catch(() => {
        // Handled by HttpFactory 401 interceptor if session expired
      });
  }, [isHydrated, isAuthenticated, accessToken, dispatch]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    const cleaned = phoneInput.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setAuthMessage(
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
      setAuthMessage(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    const cleaned = phoneInput.replace(/\D/g, '').slice(-10);
    setAuthLoading(true);
    try {
      const payload = await userAuthService.verifyOtp({
        phone: cleaned,
        otp: otpCode.trim(),
        name: nameInput.trim() || 'Aatmiya Member',
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
      setOtpSent(false);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Invalid 4-digit WhatsApp OTP. Please try again.';
      setAuthMessage(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDetectGps = () => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setGoogleMapsUrl(`https://maps.google.com/?q=${lat},${lng}`);
        setSaveBanner(`GPS Pin Locked (${lat}, ${lng})`);
      },
      () => {
        setSaveBanner('Please allow location permission in your browser.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSaveProfileAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      updateSavedAddress({
        fullName: nameInput.trim() || user.name,
        flatOrHouse: flatOrHouse.trim(),
        areaOrSociety: areaOrSociety.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        landmark: landmark.trim(),
        isSocietyResident,
        latitude,
        longitude,
        googleMapsUrl,
        isMobileConfirmed: Boolean(latitude && longitude),
      }),
    );

    if (isAuthenticated && accessToken) {
      try {
        if (nameInput.trim()) {
          await userAuthService.updateProfile({ name: nameInput.trim() });
        }
        await userAuthService.updateAddress({
          name: nameInput.trim() || user.name,
          flatOrHouse: flatOrHouse.trim(),
          areaOrSociety: areaOrSociety.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          landmark: landmark.trim(),
          isSocietyResident,
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
          googleMapsUrl: googleMapsUrl || undefined,
          isMobileConfirmed: Boolean(latitude && longitude),
        });
      } catch {
        // Saved locally in Redux
      }
    }

    setSaveBanner(
      'Address & GPS pin saved! Future checkouts will skip OTP & Address stages automatically.',
    );
  };

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
                <span className="text-primary font-bold">Profile</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                Member Profile &amp; Saved GPS Address
              </h1>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => dispatch(logoutUser())}
                className="px-4 py-2 rounded-xl bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="logout" className="text-lg" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {!isAuthenticated ? (
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/25 shadow-sm max-w-xl mx-auto space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <Icon name="chat" className="text-2xl" />
                </div>
                <div>
                  <span className="text-label-sm font-bold uppercase text-secondary">
                    Passwordless WhatsApp Login
                  </span>
                  <h2 className="font-headline-md text-on-surface mt-0.5">
                    Sign In with 4-Digit WhatsApp OTP
                  </h2>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Once signed in, your session stays active and checkout skips
                    the OTP and Address steps automatically.
                  </p>
                </div>
              </div>

              {authMessage && (
                <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-body-sm font-medium">
                  {authMessage}
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g., Priya Kulkarni"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface mb-1">
                      10-Digit WhatsApp Mobile Number
                    </label>
                    <div className="flex items-center rounded-xl bg-surface-container-low border border-outline-variant/30 px-4 py-3">
                      <span className="font-mono font-bold text-on-surface-variant pr-3 border-r border-outline-variant/40">
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
                        className="w-full pl-3 bg-transparent font-mono text-base font-bold focus:outline-none"
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
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-tertiary-fixed/60 text-on-tertiary-fixed text-body-sm flex items-center justify-between">
                    <span>
                      OTP sent to WhatsApp <strong>+91 {phoneInput}</strong>
                    </span>
                    {devOtpHint && (
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-primary font-mono font-bold text-xs">
                        Dev OTP: {devOtpHint}
                      </span>
                    )}
                  </div>
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
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-container-low border-2 border-primary text-center text-2xl font-mono font-bold tracking-[0.5em]"
                  />
                  <Button
                    type="submit"
                    disabled={authLoading}
                    variant="primary"
                    className="w-full py-3.5 text-base"
                  >
                    <Icon name="verified" className="text-lg" />
                    <span>Verify &amp; Sign In</span>
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 4 Cols: Member Identity Card */}
              <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/25 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center">
                    <Icon name="verified_user" className="text-2xl" filled />
                  </div>
                  <div>
                    <Badge variant="inStock">WhatsApp Verified</Badge>
                    <h2 className="font-headline-sm text-lg text-on-surface mt-1">
                      {user.name || 'Aatmiya Member'}
                    </h2>
                    <p className="font-mono text-body-sm text-on-surface-variant">
                      +91 {user.phone}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/25 space-y-2 text-body-sm">
                  <Link
                    href="/orders"
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium text-on-surface">
                      <Icon name="receipt_long" className="text-primary" />
                      <span>View My Orders</span>
                    </span>
                    <Icon name="chevron_right" className="text-sm" />
                  </Link>
                  <Link
                    href="/checkout"
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium text-on-surface">
                      <Icon name="shopping_bag" className="text-secondary" />
                      <span>Go to Shopping Bag</span>
                    </span>
                    <Icon name="chevron_right" className="text-sm" />
                  </Link>
                </div>
              </div>

              {/* Right 8 Cols: Saved GPS & Society Address Manager */}
              <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/25 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/25 pb-4">
                  <div>
                    <h3 className="font-headline-md text-on-surface">
                      Saved Delivery Address &amp; GPS Location
                    </h3>
                    <p className="text-body-sm text-on-surface-variant">
                      Used for 1-click checkout without repeating Stage 2 or
                      Stage 3
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectGps}
                    className="px-4 py-2 rounded-xl bg-tertiary text-on-tertiary font-label-md text-label-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon name="my_location" className="text-lg" />
                    <span>Update GPS Pin</span>
                  </button>
                </div>

                {saveBanner && (
                  <div className="p-3.5 rounded-xl bg-tertiary-fixed/60 text-on-tertiary-fixed text-body-sm font-medium">
                    {saveBanner}
                  </div>
                )}

                <form
                  onSubmit={handleSaveProfileAddress}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={nameInput || user.name}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md"
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface mb-1">
                        Flat / Tower / House No.
                      </label>
                      <input
                        type="text"
                        required
                        value={flatOrHouse}
                        onChange={(e) => setFlatOrHouse(e.target.value)}
                        placeholder="Tower B - Flat 402"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md"
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface mb-1">
                        Housing Society / Area
                      </label>
                      <input
                        type="text"
                        required
                        value={areaOrSociety}
                        onChange={(e) => setAreaOrSociety(e.target.value)}
                        placeholder="Kalpataru Harmony Society"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md"
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md"
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-md"
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface mb-1">
                        6-Digit Pincode
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={pincode}
                        onChange={(e) =>
                          setPincode(e.target.value.replace(/\D/g, ''))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 font-mono text-body-md"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 text-body-sm font-medium text-on-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSocietyResident}
                      onChange={(e) => setIsSocietyResident(e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span>
                      Housing Society Resident (Free Hand-Delivery)
                    </span>
                  </label>

                  <Button
                    type="submit"
                    variant="primary"
                    className="px-6 py-3"
                  >
                    <Icon name="save" className="text-lg" />
                    <span>Save Default Address &amp; GPS Pin</span>
                  </Button>
                </form>
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
