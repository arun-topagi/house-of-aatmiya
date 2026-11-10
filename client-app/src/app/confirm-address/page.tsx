import React, { Suspense } from 'react';
import { MobileConfirmAddressView } from '@/features';

export default function ConfirmAddressPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading GPS Confirmation...</div>}>
      <MobileConfirmAddressView />
    </Suspense>
  );
}
