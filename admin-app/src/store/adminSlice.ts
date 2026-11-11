import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AdminTab =
  | 'ORDERS'
  | 'KITCHEN_PREP'
  | 'STOREFRONT_MODES'
  | 'PRODUCTS_CMS';

interface AdminState {
  activeTab: AdminTab;
  isAuthenticated: boolean;
  accessToken: string | null;
  adminName: string;
  adminEmail: string;
  adminRole: string;
}

const STORAGE_KEY = 'aatmiya_admin_auth_v1';

const initialState: AdminState = {
  activeTab: 'ORDERS',
  isAuthenticated: false,
  accessToken: null,
  adminName: 'Aatmiya Admin',
  adminEmail: 'admin@houseofaatmiya.in',
  adminRole: 'SUPER_ADMIN',
};

function sanitizeAdminDisplayName(rawName?: string, email?: string): string {
  if (!rawName || /snehal|arun|saharsha|sreeja/i.test(rawName)) {
    return 'Aatmiya Admin';
  }
  return rawName || email?.split('@')[0] || 'Aatmiya Admin';
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<AdminTab>) {
      state.activeTab = action.payload;
    },
    hydrateAdminAuthFromStorage(state) {
      if (typeof window === 'undefined') return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed.accessToken) {
          state.isAuthenticated = true;
          state.accessToken = parsed.accessToken;
          state.adminName = sanitizeAdminDisplayName(
            parsed.adminName,
            parsed.adminEmail,
          );
          state.adminEmail = parsed.adminEmail || 'admin@houseofaatmiya.in';
          state.adminRole = parsed.adminRole || 'SUPER_ADMIN';
        }
      } catch {
        // Ignore malformed localStorage
      }
    },
    loginAdminSuccess(
      state,
      action: PayloadAction<{
        accessToken: string;
        admin?: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
        };
      }>,
    ) {
      const adminObj = action.payload.admin || {};
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.adminEmail = adminObj.email || 'admin@houseofaatmiya.in';
      state.adminName = sanitizeAdminDisplayName(
        adminObj.name,
        state.adminEmail,
      );
      state.adminRole = adminObj.role || 'SUPER_ADMIN';

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              accessToken: state.accessToken,
              adminName: state.adminName,
              adminEmail: state.adminEmail,
              adminRole: state.adminRole,
            }),
          );
          window.localStorage.setItem('accessToken', state.accessToken);
        } catch {
          // Ignore storage error
        }
      }
    },
    logoutAdmin(state) {
      state.isAuthenticated = false;
      state.accessToken = null;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem('accessToken');
      }
    },
  },
});

export const {
  setActiveTab,
  hydrateAdminAuthFromStorage,
  loginAdminSuccess,
  logoutAdmin,
} = adminSlice.actions;
export default adminSlice.reducer;
