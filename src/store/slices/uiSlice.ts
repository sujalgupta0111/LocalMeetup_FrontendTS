
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark" | "system";

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  showSignInDialog: boolean;
  showRegisterDialog: boolean;
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "system";
  }
  const saved = localStorage.getItem("theme");

  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved;
  }

  return "system";
};

const initialState: UIState = {
  theme: getInitialTheme(),
  sidebarOpen: true,
  showSignInDialog: false,
  showRegisterDialog: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;

      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
      }
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    openSignInDialog: (state) => {
      state.showSignInDialog = true;
      state.showRegisterDialog = false;
    },

    closeSignInDialog: (state) => {
      state.showSignInDialog = false;
    },

    openRegisterDialog: (state) => {
      state.showRegisterDialog = true;
      state.showSignInDialog = false;
    },

    closeRegisterDialog: (state) => {
      state.showRegisterDialog = false;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  openSignInDialog,
  closeSignInDialog,
  openRegisterDialog,
  closeRegisterDialog,
} = uiSlice.actions;

export default uiSlice.reducer;
