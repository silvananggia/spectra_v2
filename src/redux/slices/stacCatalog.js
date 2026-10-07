import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchCollections,
  searchItems,
  formatDateRange,
  extractStacError,
  normalizeBbox,
} from '../../services/stac.service';

export const fetchCollectionsAsync = createAsyncThunk(
  'stacCatalog/fetchCollections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchCollections();
      return response.collections || [];
    } catch (error) {
      return rejectWithValue(extractStacError(error) || 'Failed to fetch collections');
    }
  }
);

export const searchItemsAsync = createAsyncThunk(
  'stacCatalog/searchItems',
  async (searchParams, { rejectWithValue }) => {
    try {
      const params = { ...searchParams };

      if (params.bbox) {
        const bbox = normalizeBbox(params.bbox);
        if (bbox) {
          params.bbox = bbox;
        } else {
          delete params.bbox;
        }
      }

      if (params.startDate || params.endDate) {
        const datetime = formatDateRange(params.startDate, params.endDate);
        if (!datetime) {
          return rejectWithValue('INVALID_DATE_RANGE');
        }
        params.datetime = datetime;
        delete params.startDate;
        delete params.endDate;
      }

      const response = await searchItems(params);
      return response;
    } catch (error) {
      return rejectWithValue(extractStacError(error) || 'Failed to search items');
    }
  }
);

const initialState = {
  collections: [],
  items: [],
  loading: false,
  error: null,
  searchParams: {
    collections: [],
    startDate: null,
    endDate: null,
  },
};

const stacCatalogSlice = createSlice({
  name: 'stacCatalog',
  initialState,
  reducers: {
    setSelectedCollections: (state, action) => {
      state.searchParams.collections = action.payload;
    },
    setDateRange: (state, action) => {
      state.searchParams.startDate = action.payload.startDate;
      state.searchParams.endDate = action.payload.endDate;
    },
    clearSearch: (state) => {
      state.items = [];
      state.searchParams = {
        collections: [],
        startDate: null,
        endDate: null,
      };
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollectionsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollectionsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload;
        state.error = null;
      })
      .addCase(fetchCollectionsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.collections = [];
      })
      .addCase(searchItemsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchItemsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.features || [];
        state.error = null;
      })
      .addCase(searchItemsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      });
  },
});

export const {
  setSelectedCollections,
  setDateRange,
  clearSearch,
  clearError,
} = stacCatalogSlice.actions;

export default stacCatalogSlice.reducer;
