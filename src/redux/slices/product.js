import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProducts, transformProducts } from '../../services/product.service';

/**
 * Async thunk to fetch products
 */
export const fetchProductsAsync = createAsyncThunk(
  'product/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchProducts(params);
      
      if (response.status === 'success' && response.data) {
        const transformedProducts = transformProducts(response.data);
        return {
          products: transformedProducts,
          filters: {
            region: params.region || '',
            category: params.category || 'Semua kejadian',
          },
        };
      } else {
        return rejectWithValue('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products. Please try again later.'
      );
    }
  }
);

const initialState = {
  products: [],
  filteredProducts: [],
  loading: false,
  error: null,
  filters: {
    region: '',
    category: 'Semua kejadian',
  },
  lastFetchParams: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setFilteredProducts: (state, action) => {
      state.filteredProducts = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
      state.filteredProducts = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProductsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.filteredProducts = action.payload.products;
        state.filters = action.payload.filters;
        state.error = null;
      })
      .addCase(fetchProductsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
        state.products = [];
        state.filteredProducts = [];
      });
  },
});

export const {
  setProducts,
  setFilteredProducts,
  setFilters,
  setLoading,
  setError,
  clearProducts,
  clearError,
} = productSlice.actions;

export default productSlice.reducer;

