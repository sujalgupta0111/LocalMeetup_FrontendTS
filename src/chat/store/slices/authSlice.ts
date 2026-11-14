import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {type User } from '../../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
}

const savedUser = localStorage.getItem('chatsphere_user');
const savedAccessToken = localStorage.getItem('chatsphere_access_token');
const savedRefreshToken = localStorage.getItem('chatsphere_refresh_token');
const savedTheme = (localStorage.getItem('chatsphere_theme') as 'light' | 'dark') || 'dark';

if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  accessToken: savedAccessToken,
  refreshToken: savedRefreshToken,
  isAuthenticated: !!savedAccessToken,
  theme: savedTheme,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;

      localStorage.setItem('chatsphere_user', JSON.stringify(user));
      localStorage.setItem('chatsphere_access_token', accessToken);
      localStorage.setItem('chatsphere_refresh_token', refreshToken);
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('chatsphere_user', JSON.stringify(state.user));
      }
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem('chatsphere_user');
      localStorage.removeItem('chatsphere_access_token');
      localStorage.removeItem('chatsphere_refresh_token');
    },

    toggleTheme: (state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      localStorage.setItem('chatsphere_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  },
});

export const { setCredentials, updateUser, logout, toggleTheme } = authSlice.actions;
export default authSlice.reducer;
