
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '@/types';
import { getCustomers } from '@/services/adminService';

interface CustomerState {
    items: Customer[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: CustomerState = {
    items: [],
    status: 'idle',
    error: null,
};

export const fetchCustomers = createAsyncThunk('customers/fetchCustomers', async () => {
    return await getCustomers();
});

const customerSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch customers';
            });
    },
});

export default customerSlice.reducer;
