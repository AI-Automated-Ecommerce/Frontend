
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BusinessDetail, BusinessDetailCreate, BusinessDetailUpdate } from '@/types/business';
import { businessService } from '@/services/businessService';

interface BusinessState {
    details: BusinessDetail[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: BusinessState = {
    details: [],
    status: 'idle',
    error: null,
};

export const fetchBusinessDetails = createAsyncThunk('business/fetchAll', async () => {
    return await businessService.getAllDetails();
});

export const createBusinessDetail = createAsyncThunk('business/create', async (detail: BusinessDetailCreate) => {
    return await businessService.createDetail(detail);
});

export const updateBusinessDetail = createAsyncThunk('business/update', async ({ id, detail }: { id: number; detail: BusinessDetailUpdate }) => {
    return await businessService.updateDetail(id, detail);
});

export const deleteBusinessDetail = createAsyncThunk('business/delete', async (id: number) => {
    await businessService.deleteDetail(id);
    return id;
});

const businessSlice = createSlice({
    name: 'business',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBusinessDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBusinessDetails.fulfilled, (state, action: PayloadAction<BusinessDetail[]>) => {
                state.status = 'succeeded';
                state.details = action.payload;
            })
            .addCase(fetchBusinessDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch business details';
            })
            .addCase(createBusinessDetail.fulfilled, (state, action) => {
                state.details.push(action.payload);
            })
            .addCase(updateBusinessDetail.fulfilled, (state, action) => {
                const index = state.details.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.details[index] = action.payload;
                }
            })
            .addCase(deleteBusinessDetail.fulfilled, (state, action) => {
                state.details = state.details.filter(d => d.id !== action.payload);
            });
    },
});

export default businessSlice.reducer;
