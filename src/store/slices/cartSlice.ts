
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product & { quantity?: number }>) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);
      const quantityToAdd = newItem.quantity || 1;

      state.totalQuantity += quantityToAdd;
      state.totalAmount += newItem.price * quantityToAdd;

      if (!existingItem) {
        state.items.push({
          id: newItem.id,
          name: newItem.name,
          price: newItem.price,
          quantity: quantityToAdd,
          image: newItem.imageUrl,
        });
      } else {
        existingItem.quantity += quantityToAdd;
      }
    },
    removeFromCart(state, action: PayloadAction<number>) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((item) => item.id !== id);
      }
    },
    updateQuantity(state, action: PayloadAction<{ id: number; quantity: number }>) {
        const { id, quantity } = action.payload;
        const existingItem = state.items.find((item) => item.id === id);

        if (existingItem && quantity > 0) {
            const quantityDiff = quantity - existingItem.quantity;
            state.totalQuantity += quantityDiff;
            state.totalAmount += existingItem.price * quantityDiff;
            existingItem.quantity = quantity;
        }
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
