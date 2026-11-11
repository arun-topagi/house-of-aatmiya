'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import {
  hydrateUserAuthFromStorage,
  logoutUser,
  syncUserProfile,
} from './slices/userAuthSlice';
import HttpFactory from '@/utils/httpFactory';
import { userAuthService } from '@/services/user-auth.service';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    store.dispatch(hydrateUserAuthFromStorage());

    HttpFactory.onSessionExpired = () => {
      store.dispatch(logoutUser());
    };

    const state = store.getState();
    if (state.userAuth.isAuthenticated && state.userAuth.accessToken) {
      userAuthService
        .getProfile()
        .then((res) => {
          if (res?.user) {
            store.dispatch(
              syncUserProfile({
                user: res.user,
                address: res.address || undefined,
              }),
            );
          }
        })
        .catch(() => {
          // Handled by HttpFactory 401 interceptor if token expired
        });
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
