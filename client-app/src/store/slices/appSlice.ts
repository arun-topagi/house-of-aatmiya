import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type StorefrontMode = 'ALL' | 'DRESS_AND_GIFTS' | 'FOODS_ONLY';

interface AppState {
  activeMode: StorefrontMode;
  allowModeSwitching: boolean;
  nextFoodBatchLabel: string;
  whatsappPhone: string;
}

const initialState: AppState = {
  activeMode: 'ALL',
  allowModeSwitching: true,
  nextFoodBatchLabel: 'Next Fresh Batch: Friday (Orders close Wednesday)',
  whatsappPhone: '919876543210',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setStorefrontMode(state, action: PayloadAction<StorefrontMode>) {
      state.activeMode = action.payload;
    },
    syncStoreSettings(
      state,
      action: PayloadAction<{
        defaultMode?: StorefrontMode;
        allowModeSwitching?: boolean;
        nextFoodBatchLabel?: string;
        whatsappPhone?: string;
      }>,
    ) {
      if (action.payload.defaultMode) {
        state.activeMode = action.payload.defaultMode;
      }
      if (action.payload.allowModeSwitching !== undefined) {
        state.allowModeSwitching = action.payload.allowModeSwitching;
      }
      if (action.payload.nextFoodBatchLabel) {
        state.nextFoodBatchLabel = action.payload.nextFoodBatchLabel;
      }
      if (action.payload.whatsappPhone) {
        state.whatsappPhone = action.payload.whatsappPhone;
      }
    },
  },
});

export const { setStorefrontMode, syncStoreSettings } = appSlice.actions;
export default appSlice.reducer;
