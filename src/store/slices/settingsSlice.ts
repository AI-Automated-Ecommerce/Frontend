
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BusinessSettings, BusinessSettingsUpdate } from '@/types/settings';
import { settingsService } from '@/services/settingsService';

interface SettingsState {
    settings: BusinessSettings | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: SettingsState = {
    settings: null,
    status: 'idle',
    error: null,
};

export const fetchSettings = createAsyncThunk('settings/fetch', async () => {
    return await settingsService.getSettings();
});

export const updateSettings = createAsyncThunk('settings/update', async (data: BusinessSettingsUpdate) => {
    return await settingsService.updateSettings(data);
});

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<BusinessSettings>) => {
                state.status = 'succeeded';
                state.settings = action.payload;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch settings';
            })
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.settings = action.payload;
            });
    },
});

export default settingsSlice.reducer;
