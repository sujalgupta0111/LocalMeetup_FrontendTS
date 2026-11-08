
import { configureStore } from "@reduxjs/toolkit";


import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import locationReducer from "./slices/locationSlice";
import userReducer from "./slices/userSlice";
import uiReducer from "./slices/uiSlice";

export const stores = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    location: locationReducer,
    user: userReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof stores.getState>;
export type AppDispatch = typeof stores.dispatch;

export default stores;
