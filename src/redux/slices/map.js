import { createSlice } from '@reduxjs/toolkit';
import {
    ADD_WMS_LAYER,
    SET_COLLECTION
} from '../../actions/types';

const initialState = {
    layers: [],
    collection: null,
    loading: false,
    error: null
};

const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        addLayer: (state, action) => {
            state.layers.push(action.payload);
        },
        removeLayer: (state, action) => {
            state.layers = state.layers.filter(
                (layer) => layer.id !== action.payload
            );
        },
        setLayers: (state, action) => {
            state.layers = action.payload;
        },
        setCollection: (state, action) => {
            state.collection = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearMap: (state) => {
            state.layers = [];
            state.collection = null;
        }
    }
});

export const {
    addLayer,
    removeLayer,
    setLayers,
    setCollection,
    setLoading,
    setError,
    clearMap
} = mapSlice.actions;
export default mapSlice.reducer;
