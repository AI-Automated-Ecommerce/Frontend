

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '@/types';
import * as adminService from '@/services/adminService';
import * as orderService from '@/services/orderService';

interface OrderState {
    items: Order[];
    currentOrder: orderService.PlaceOrderResponse | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: OrderState = {
    items: [],
    currentOrder: null,
    status: 'idle',
    error: null,
};

export const fetchAdminOrders = createAsyncThunk('orders/fetchAdminOrders', async () => {
    return await adminService.getAdminOrders();
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ orderId, status }: { orderId: number; status: string }) => {
    await adminService.updateOrderStatus(orderId, status);
    return { orderId, status };
});

export const placeOrder = createAsyncThunk('orders/placeOrder', async (orderData: orderService.PlaceOrderRequest) => {
    return await orderService.placeOrder(orderData);
});

export const uploadPaymentReceipt = createAsyncThunk(
    'orders/uploadPaymentReceipt',
    async ({ orderId, file }: { orderId: number; file: File }) => {
        return await orderService.uploadPaymentReceipt(orderId, file);
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        resetCurrentOrder(state) {
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Orders
            .addCase(fetchAdminOrders.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAdminOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchAdminOrders.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch orders';
            })
            // Update Status
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const { orderId, status } = action.payload;
                const order = state.items.find(o => o.id === orderId);
                if (order) {
                    order.status = status as OrderStatus;
                }
            })
            // Place Order
            .addCase(placeOrder.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(placeOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload;
            })
            .addCase(placeOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to place order';
            });
    },
});

export const { resetCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
