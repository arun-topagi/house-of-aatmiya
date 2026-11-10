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

interface UserAuthState {
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

function loadInitialState(): UserAuthState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      user: { ...defaultState.user, ...(parsed.user || {}) },
      address: { ...defaultState.address, ...(parsed.address || {}) },
    };
  } catch {
    return defaultState;
  }
}

function persistState(state: UserAuthState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState: loadInitialState(),
  reducers: {
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
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = { id: '', phone: '', name: '', isPhoneVerified: false };
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    },
  },
});

export const { setUserCredentials, updateSavedAddress, logoutUser } =
  userAuthSlice.actions;
export default userAuthSlice.reducer;
