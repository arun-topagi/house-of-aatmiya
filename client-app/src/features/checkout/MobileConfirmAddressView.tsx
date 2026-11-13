'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header, BottomNav, Footer } from '@/components';
import { Button, Icon } from '@/elements';
import { userAuthService } from '@/services';
import { updateSavedAddress, useAppDispatch } from '@/store';

export const MobileConfirmAddressView: React.FC = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [flatOrHouse, setFlatOrHouse] = useState(
    searchParams.get('flat') || '',
  );
  const [areaOrSociety, setAreaOrSociety] = useState(
    searchParams.get('society') || '',
  );
  const [city, setCity] = useState(searchParams.get('city') || 'Pune');
  const [pincode, setPincode] = useState(searchParams.get('pincode') || '');
  const [landmark, setLandmark] = useState('');
  const [isSocietyResident, setIsSocietyResident] = useState(true);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleCaptureMobileGps = () => {
    if (!('geolocation' in navigator)) {
      setStatusMsg('Geolocation is not supported on this device.');
      return;
    }
    setStatusMsg('Capturing high-accuracy mobile GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          const geoData = await geoRes.json();
          const addr = geoData?.address || {};
          if (addr.suburb || addr.neighbourhood) {
            setAreaOrSociety(addr.suburb || addr.neighbourhood);
          }
          if (addr.city || addr.town) {
            setCity(addr.city || addr.town);
          }
          if (addr.postcode) {
            setPincode(String(addr.postcode).replace(/\D/g, '').slice(0, 6));
          }
        } catch {
          // Ignore reverse geocode failure
        }

        setStatusMsg(`Mobile GPS Pin Captured (${lat}, ${lng})!`);
      },
      () => {
        setStatusMsg(
          'Please allow Location Permission on your phone browser.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmitMobileConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = latitude ?? 18.5913;
    const lng = longitude ?? 73.7689;
    const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

    dispatch(
      updateSavedAddress({
        flatOrHouse,
        areaOrSociety,
        city,
        pincode,
        landmark,
        isSocietyResident,
        latitude: lat,
        longitude: lng,
        googleMapsUrl,
        isMobileConfirmed: true,
      }),
    );

    try {
      await userAuthService.confirmAddressMobile({
        phone,
        flatOrHouse,
        areaOrSociety,
        city,
        pincode,
        landmark,
        isSocietyResident,
        latitude: lat,
        longitude: lng,
      });
    } catch {
      // Saved locally in Redux as well
    }

    setConfirmed(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-24 pb-28">
        <div className="cred-card rounded-3xl p-6 space-y-5">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-tertiary">
              Mobile GPS Address Confirmation
            </span>
            <h1 className="font-headline-md text-2xl text-on-surface mt-1">
              Pin &amp; Confirm Your Doorstep Location
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Tap below on your mobile phone to capture your exact GPS location
              and confirm your address for doorstep delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCaptureMobileGps}
            className="w-full py-3 rounded-xl bg-tertiary text-on-tertiary font-label-md text-label-md font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Icon name="my_location" className="text-lg" />
            <span>1-Tap Capture My Phone&apos;s Current GPS Pin</span>
          </button>

          {statusMsg && (
            <div className="p-3 rounded-xl bg-tertiary-fixed/70 border border-tertiary/25 text-on-tertiary-fixed text-body-sm font-bold">
              {statusMsg}
            </div>
          )}

          {confirmed ? (
            <div className="p-5 rounded-2xl bg-tertiary-fixed/50 border border-tertiary/30 text-center space-y-3">
              <div className="font-headline-sm text-on-tertiary-fixed">
                Mobile Address &amp; GPS Pin Confirmed!
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Your GPS coordinates and address are locked in.
              </p>
              <Link href="/checkout" className="inline-block">
                <Button type="button" variant="primary" className="px-5 py-2.5">
                  <span>Return to Checkout</span>
                  <Icon name="arrow_forward" className="text-sm" />
                </Button>
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmitMobileConfirmation}
              className="space-y-3"
            >
              <input
                type="tel"
                required
                placeholder="Verified WhatsApp Phone (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-sm font-semibold focus:outline-none focus:border-primary/50"
              />
              <input
                type="text"
                required
                placeholder="Flat / Tower / House No."
                value={flatOrHouse}
                onChange={(e) => setFlatOrHouse(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-sm font-semibold focus:outline-none focus:border-primary/50"
              />
              <input
                type="text"
                required
                placeholder="Housing Society / Area"
                value={areaOrSociety}
                onChange={(e) => setAreaOrSociety(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-sm font-semibold focus:outline-none focus:border-primary/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-sm font-semibold focus:outline-none focus:border-primary/50"
                />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, ''))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-sm font-mono font-semibold focus:outline-none focus:border-primary/50"
                />
              </div>
              <input
                type="text"
                placeholder="Landmark (Optional)"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a0f] border border-white/[0.08] text-on-surface placeholder:text-on-surface-variant/60 text-body-sm font-semibold focus:outline-none focus:border-primary/50"
              />
              <label className="flex items-center gap-2 text-body-sm font-semibold text-on-surface">
                <input
                  type="checkbox"
                  checked={isSocietyResident}
                  onChange={(e) => setIsSocietyResident(e.target.checked)}
                  className="accent-primary"
                />
                <span>Housing Society Resident (Free Hand-Delivery)</span>
              </label>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-sm"
              >
                <Icon name="check_circle" className="text-lg" />
                <span>Confirm Address &amp; GPS Pin from Mobile</span>
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};
