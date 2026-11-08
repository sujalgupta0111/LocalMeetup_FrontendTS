
import { createSlice } from "@reduxjs/toolkit";

export interface AuthUser {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginPayload {
  user: AuthUser;
  token: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: { payload: boolean }) => {
      state.loading = action.payload;
    },

    setError: (state, action: { payload: string | null }) => {
      state.error = action.payload;
    },

    loginSuccess: (state, action: { payload: LoginPayload }) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },

    loginFailure: (state, action: { payload: string }) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = action.payload;
    },

    registerSuccess: (state, action: { payload: LoginPayload }) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },

    registerFailure: (state, action: { payload: string }) => {
      state.loading = false;
      state.error = action.payload;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    },

    setUser: (state, action: { payload: AuthUser | null }) => {
      state.user = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  loginSuccess,
  loginFailure,
  registerSuccess,
  registerFailure,
  logout,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;
