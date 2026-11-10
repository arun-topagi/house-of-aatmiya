import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AdminTab =
  | 'ORDERS'
  | 'KITCHEN_PREP'
  | 'STOREFRONT_MODES'
  | 'PRODUCTS_CMS'
  | 'REORDER_RADAR';

interface AdminState {
  activeTab: AdminTab;
  adminName: string;
  adminEmail: string;
}

const initialState: AdminState = {
  activeTab: 'ORDERS',
  adminName: 'Snehal (Founder & Creator)',
  adminEmail: 'snehal@houseofaatmiya.in',
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<AdminTab>) {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = adminSlice.actions;
export default adminSlice.reducer;
