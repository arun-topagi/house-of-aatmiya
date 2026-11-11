import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface CartItem {
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  categorySlug: string;
  sizePack: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  isMadeToBatch?: boolean;
}

interface CartState {
  items: CartItem[];
  giftNote: string;
  lastAddedTimestamp: number | null;
}

const initialState: CartState = {
  items: [],
  giftNote: '',
  lastAddedTimestamp: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (i) => i.variantId === action.payload.variantId,
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.lastAddedTimestamp = Date.now();
    },
    updateQuantity(
      state,
      action: PayloadAction<{ variantId: string; quantity: number }>,
    ) {
      const item = state.items.find(
        (i) => i.variantId === action.payload.variantId,
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) => i.variantId !== action.payload.variantId,
          );
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      state.lastAddedTimestamp = Date.now();
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.variantId !== action.payload);
    },
    setGiftNote(state, action: PayloadAction<string>) {
      state.giftNote = action.payload;
    },
    clearCart(state) {
      state.items = [];
      state.giftNote = '';
      state.lastAddedTimestamp = null;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  setGiftNote,
  clearCart,
} = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotalItems = (state: RootState) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotalPrice = (state: RootState) =>
  state.cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
export const selectLastAddedTimestamp = (state: RootState) =>
  state.cart.lastAddedTimestamp;

export default cartSlice.reducer;
