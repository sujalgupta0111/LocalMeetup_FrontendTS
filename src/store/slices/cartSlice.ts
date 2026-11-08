
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Product {
  id: string | number;
  name: string;
  price: number;
  [key: string]: unknown;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
}

interface UpdateQuantityPayload {
  productId: Product["id"];
  quantity: number;
}

const initialState: CartState = {
  items: [],
  totalPrice: 0,
};

const calculateTotalPrice = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const product = action.payload;

      const existingItem = state.items.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          ...product,
          quantity: 1,
        });
      }

      state.totalPrice = calculateTotalPrice(state.items);
    },

    removeFromCart: (
      state,
      action: PayloadAction<Product["id"]>
    ) => {
      const productId = action.payload;

      state.items = state.items.filter(
        (item) => item.id !== productId
      );

      state.totalPrice = calculateTotalPrice(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<UpdateQuantityPayload>
    ) => {
      const { productId, quantity } = action.payload;

      const item = state.items.find(
        (item) => item.id === productId
      );

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            (item) => item.id !== productId
          );
        } else {
          item.quantity = quantity;
        }
      }

      state.totalPrice = calculateTotalPrice(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

