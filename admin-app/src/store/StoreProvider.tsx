'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { hydrateAdminAuthFromStorage } from './adminSlice';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    store.dispatch(hydrateAdminAuthFromStorage());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
