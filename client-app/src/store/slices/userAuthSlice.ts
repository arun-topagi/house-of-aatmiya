import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SavedUserAddress {
  id?: string;
  flatOrHouse: string;
  areaOrSociety: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  isSocietyResident: boolean;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string;
  isMobileConfirmed: boolean;
}

export interface UserAuthState {
  isHydrated: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    phone: string;
    name: string;
    isPhoneVerified: boolean;
  };
  address: SavedUserAddress;
}

const STORAGE_KEY = 'aatmiya_user_auth_v1';

const defaultState: UserAuthState = {
  isHydrated: false,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  user: {
    id: '',
    phone: '',
    name: '',
    isPhoneVerified: false,
  },
  address: {
    flatOrHouse: '',
    areaOrSociety: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '',
    landmark: '',
    isSocietyResident: true,
    latitude: null,
    longitude: null,
    googleMapsUrl: '',
    isMobileConfirmed: false,
  },
};

function persistState(state: UserAuthState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.accessToken) {
      window.localStorage.setItem('aatmiya_user_token', state.accessToken);
    }
    if (state.refreshToken) {
      window.localStorage.setItem(
        'aatmiya_user_refresh_token',
        state.refreshToken,
      );
    }
  } catch {
    // Ignore storage quota errors
  }
}

const userAuthSlice = createSlice({
  name: 'userAuth',
  // Always start with defaultState so SSR and initial client hydration match 100%
  initialState: defaultState,
  reducers: {
    hydrateUserAuthFromStorage(state) {
      state.isHydrated = true;
      if (typeof window === 'undefined') return;
      try {
        const directToken = window.localStorage.getItem('aatmiya_user_token');
        const directRefresh = window.localStorage.getItem(
          'aatmiya_user_refresh_token',
        );
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw && !directToken && !directRefresh) return;
        const parsed = raw ? JSON.parse(raw) : {};
        const resolvedToken = directToken || parsed.accessToken || null;
        const resolvedRefresh = directRefresh || parsed.refreshToken || null;
        // Reject any stale fake local tokens
        if (resolvedToken === 'local-verified-token') {
          window.localStorage.removeItem(STORAGE_KEY);
          window.localStorage.removeItem('aatmiya_user_token');
          window.localStorage.removeItem('aatmiya_user_refresh_token');
          return;
        }
        if (resolvedToken || resolvedRefresh) {
          state.isAuthenticated = true;
          state.accessToken = resolvedToken;
          state.refreshToken = resolvedRefresh;
        }
        if (parsed.user) {
          state.user = { ...defaultState.user, ...parsed.user };
        }
        if (parsed.address) {
          state.address = { ...defaultState.address, ...parsed.address };
        }
      } catch {
        // Ignore malformed storage
      }
    },
    setUserCredentials(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: {
          id: string;
          phone: string;
          name: string;
          isPhoneVerified: boolean;
        };
        address?: Partial<SavedUserAddress> | null;
      }>,
    ) {
      state.isHydrated = true;
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      if (action.payload.address) {
        state.address = {
          ...state.address,
          ...action.payload.address,
        };
      }
      persistState(state);
    },
    syncUserProfile(
      state,
      action: PayloadAction<{
        user?: Partial<UserAuthState['user']>;
        address?: Partial<SavedUserAddress> | null;
      }>,
    ) {
      if (action.payload.user) {
        state.user = {
          ...state.user,
          ...action.payload.user,
        };
      }
      if (action.payload.address) {
        state.address = {
          ...state.address,
          ...action.payload.address,
        };
      }
      persistState(state);
    },
    updateSavedAddress(
      state,
      action: PayloadAction<Partial<SavedUserAddress> & { fullName?: string }>,
    ) {
      if (action.payload.fullName) {
        state.user.name = action.payload.fullName;
      }
      state.address = {
        ...state.address,
        ...action.payload,
      };
      persistState(state);
    },
    logoutUser(state) {
      state.isHydrated = true;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = { id: '', phone: '', name: '', isPhoneVerified: false };
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem('aatmiya_user_token');
        window.localStorage.removeItem('aatmiya_user_refresh_token');
      }
    },
  },
});

export const {
  hydrateUserAuthFromStorage,
  setUserCredentials,
  syncUserProfile,
  updateSavedAddress,
  logoutUser,
} = userAuthSlice.actions;

export const selectIsAuthHydrated = (state: { userAuth: UserAuthState }) =>
  state.userAuth.isHydrated;
export const selectIsUserAuthenticated = (state: { userAuth: UserAuthState }) =>
  state.userAuth.isAuthenticated;

export default userAuthSlice.reducer;
