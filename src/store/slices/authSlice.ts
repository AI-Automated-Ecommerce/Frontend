
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Mock admin credentials
const MOCK_ADMIN = {
  email: 'admin@store.com',
  password: 'admin123',
  name: 'Admin User',
};

// Check for existing session
const savedUser = localStorage.getItem('adminUser');
const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      const userData = { email: MOCK_ADMIN.email, name: MOCK_ADMIN.name };
      localStorage.setItem('adminUser', JSON.stringify(userData));
      return userData;
    }
    throw new Error('Invalid credentials');
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('adminUser');
    return;
});


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
          state.user = null;
          state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;
