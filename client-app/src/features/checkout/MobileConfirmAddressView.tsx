"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import { apiClient } from '@/services/api';
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
        setStatusMsg('Please allow Location Permission on your phone browser.');
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
      await apiClient.post('/user-auth/confirm-address-mobile', {
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
    <div className="min-h-screen flex flex-col bg-[#faf7f2]">
      <Header />
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-6 border border-[#e5dccb] shadow-xs space-y-5">
          <div>
            <span className="text-xs font-bold uppercase text-[#234d36]">
              Mobile GPS Address Confirmation
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#1b2a4a] mt-1">
              Pin & Confirm Your Doorstep Location
            </h1>
            <p className="text-xs text-[#57534e] mt-1">
              Tap below on your mobile phone to capture your exact GPS location
              and confirm your address for Snehal&apos;s delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCaptureMobileGps}
            className="w-full py-3 rounded-xl bg-[#234d36] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            📍 1-Tap Capture My Phone&apos;s Current GPS Pin
          </button>

          {statusMsg && (
            <div className="p-3 rounded-xl bg-[#234d36]/10 text-[#234d36] text-xs font-bold">
              {statusMsg}
            </div>
          )}

          {confirmed ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="text-sm font-bold text-[#234d36]">
                ✅ Mobile Address & GPS Pin Confirmed!
              </div>
              <p className="text-xs text-[#57534e]">
                Your GPS coordinates and address are locked in.
              </p>
              <Link
                href="/checkout"
                className="inline-block px-5 py-2.5 rounded-full bg-[#1b2a4a] text-white text-xs font-bold"
              >
                Return to Checkout →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmitMobileConfirmation} className="space-y-3">
              <input
                type="tel"
                required
                placeholder="Verified WhatsApp Phone (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] border border-[#e5dccb] text-xs font-semibold"
              />
              <input
                type="text"
                required
                placeholder="Flat / Tower / House No."
                value={flatOrHouse}
                onChange={(e) => setFlatOrHouse(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] border border-[#e5dccb] text-xs font-semibold"
              />
              <input
                type="text"
                required
                placeholder="Housing Society / Area"
                value={areaOrSociety}
                onChange={(e) => setAreaOrSociety(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] border border-[#e5dccb] text-xs font-semibold"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] border border-[#e5dccb] text-xs font-semibold"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] border border-[#e5dccb] text-xs font-semibold"
                />
              </div>
              <input
                type="text"
                placeholder="Landmark (Optional)"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] border border-[#e5dccb] text-xs font-semibold"
              />
              <label className="flex items-center gap-2 text-xs font-semibold text-[#1b2a4a]">
                <input
                  type="checkbox"
                  checked={isSocietyResident}
                  onChange={(e) => setIsSocietyResident(e.target.checked)}
                />
                <span>Housing Society Resident (Free Hand-Delivery)</span>
              </label>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1b2a4a] text-white text-xs font-bold cursor-pointer"
              >
                ✓ Confirm Address & GPS Pin from Mobile
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
