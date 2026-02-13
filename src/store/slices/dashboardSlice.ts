
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getDashboardStats, DashboardStats } from '@/services/adminService';

interface DashboardState {
    stats: DashboardStats | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: DashboardState = {
    stats: null,
    status: 'idle',
    error: null,
};

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async () => {
    return await getDashboardStats();
});

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
                state.status = 'succeeded';
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch dashboard stats';
            });
    },
});

export default dashboardSlice.reducer;
