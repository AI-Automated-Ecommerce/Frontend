
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';
import * as adminService from '@/services/adminService';
import { getProducts as getPublicProducts } from '@/services/productService';

interface ProductState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductState = {
    items: [],
    status: 'idle',
    error: null,
};

// Async thunks
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (isAdmin?: boolean) => {
    if (isAdmin) {
        return await adminService.getProducts();
    } else {
        return await getPublicProducts();
    }
});

export const createProduct = createAsyncThunk('products/createProduct', async (product: Omit<Product, 'id'>) => {
    return await adminService.createProduct(product);
});

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, product }: { id: number; product: Partial<Product> }) => {
    return await adminService.updateProduct(id, product);
});

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id: number) => {
    await adminService.deleteProduct(id);
    return id;
});

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch products';
            })
            // Create Product
            .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.items.push(action.payload);
            })
            // Update Product
            .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.items.findIndex(product => product.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete Product
            .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter(product => product.id !== action.payload);
            });
    },
});

export default productSlice.reducer;
