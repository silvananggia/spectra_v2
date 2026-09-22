import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    information: [],
    currentInformation: null,
    loading: false,
    error: null
};

const informationSlice = createSlice({
    name: 'information',
    initialState,
    reducers: {
        setInformation: (state, action) => {
            state.information = action.payload;
        },
        addInformation: (state, action) => {
            state.information.push(action.payload);
        },
        setCurrentInformation: (state, action) => {
            state.currentInformation = action.payload;
        },
        updateInformation: (state, action) => {
            const index = state.information.findIndex(
                (info) => info.id === action.payload.id
            );
            if (index !== -1) {
                state.information[index] = action.payload;
            }
        },
        removeInformation: (state, action) => {
            state.information = state.information.filter(
                (info) => info.id !== action.payload
            );
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearInformation: (state) => {
            state.information = [];
            state.currentInformation = null;
        }
    }
});

export const {
    setInformation,
    addInformation,
    setCurrentInformation,
    updateInformation,
    removeInformation,
    setLoading,
    setError,
    clearInformation
} = informationSlice.actions;
export default informationSlice.reducer;
