import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as mapService from '../../services/map.service';

/**
 * Fetch map by ID with all layers
 */
export const fetchMapByIdAsync = createAsyncThunk(
  'dynamicMap/fetchMapById',
  async (mapId, { rejectWithValue }) => {
    try {
      const response = await mapService.fetchMapById(mapId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch map'
      );
    }
  }
);

/**
 * Fetch all maps
 */
export const fetchMapsAsync = createAsyncThunk(
  'dynamicMap/fetchMaps',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mapService.fetchMaps();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch maps'
      );
    }
  }
);

const initialState = {
  maps: [],
  currentMap: null,
  layerStates: {}, // { [layerId]: { visible: boolean, opacity: number } }
  selectedBasemap: 'carto',
  loading: false,
  error: null,
};

const dynamicMapSlice = createSlice({
  name: 'dynamicMap',
  initialState,
  reducers: {
    setCurrentMap: (state, action) => {
      state.currentMap = action.payload;
      // Initialize layer states
      if (action.payload?.layer_groups) {
        action.payload.layer_groups.forEach((group) => {
          group.layers?.forEach((layer) => {
            const layerId = `layer-${layer.id}`;
            if (!state.layerStates[layerId]) {
              state.layerStates[layerId] = {
                visible: layer.visible !== false,
                opacity: 0.7,
              };
            }
          });
        });
      }
    },
    toggleLayerVisibility: (state, action) => {
      const layerId = action.payload;
      if (state.layerStates[layerId]) {
        state.layerStates[layerId].visible = !state.layerStates[layerId].visible;
      }
    },
    setLayerOpacity: (state, action) => {
      const { layerId, opacity } = action.payload;
      if (state.layerStates[layerId]) {
        state.layerStates[layerId].opacity = Math.max(0, Math.min(1, opacity));
      }
    },
    setLayerVisibility: (state, action) => {
      const { layerId, visible } = action.payload;
      if (state.layerStates[layerId]) {
        state.layerStates[layerId].visible = visible;
      }
    },
    setSelectedBasemap: (state, action) => {
      state.selectedBasemap = action.payload;
    },
    showAllLayers: (state) => {
      Object.keys(state.layerStates).forEach((layerId) => {
        state.layerStates[layerId].visible = true;
      });
    },
    hideAllLayers: (state) => {
      Object.keys(state.layerStates).forEach((layerId) => {
        state.layerStates[layerId].visible = false;
      });
    },
    clearMap: (state) => {
      state.currentMap = null;
      state.layerStates = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch map by ID
      .addCase(fetchMapByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMapByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Handle API response structure: { status, code, data }
        const mapData = action.payload?.data || action.payload;
        state.currentMap = mapData;
        // Initialize layer states
        if (mapData?.layer_groups) {
          mapData.layer_groups.forEach((group) => {
            group.layers?.forEach((layer) => {
              const layerId = `layer-${layer.id}`;
              state.layerStates[layerId] = {
                visible: layer.visible !== false,
                opacity: 0.7,
              };
            });
          });
        }
      })
      .addCase(fetchMapByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all maps
      .addCase(fetchMapsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMapsAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Handle API response structure: { status, code, data }
        state.maps = action.payload?.data || action.payload || [];
      })
      .addCase(fetchMapsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentMap,
  toggleLayerVisibility,
  setLayerOpacity,
  setLayerVisibility,
  setSelectedBasemap,
  showAllLayers,
  hideAllLayers,
  clearMap,
  clearError,
} = dynamicMapSlice.actions;

export default dynamicMapSlice.reducer;

