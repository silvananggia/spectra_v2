import { createSlice } from '@reduxjs/toolkit';
import {
    CREATE_JOB,
    GET_JOB,
    GET_ALL_JOB,
    GET_HOTSPOT_INFO,
    GET_LOCATION_LOOKUP,
    GET_HOTSPOT_DETAIL,
    GET_RESULT,
    SET_SELECTED_JOB
} from '../../actions/types';

const initialState = {
    jobs: [],
    currentJob: null,
    selectedJob: null,
    hotspotInfo: null,
    locationLookup: [],
    hotspotDetail: null,
    results: [],
    loading: false,
    error: null
};

const jobSlice = createSlice({
    name: 'job',
    initialState,
    reducers: {
        setJobs: (state, action) => {
            state.jobs = action.payload;
        },
        setCurrentJob: (state, action) => {
            state.currentJob = action.payload;
        },
        setSelectedJob: (state, action) => {
            state.selectedJob = action.payload;
        },
        setHotspotInfo: (state, action) => {
            state.hotspotInfo = action.payload;
        },
        setLocationLookup: (state, action) => {
            state.locationLookup = action.payload;
        },
        setHotspotDetail: (state, action) => {
            state.hotspotDetail = action.payload;
        },
        setResults: (state, action) => {
            state.results = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearJob: (state) => {
            state.currentJob = null;
            state.selectedJob = null;
        }
    }
});

export const {
    setJobs,
    setCurrentJob,
    setSelectedJob,
    setHotspotInfo,
    setLocationLookup,
    setHotspotDetail,
    setResults,
    setLoading,
    setError,
    clearJob
} = jobSlice.actions;
export default jobSlice.reducer;
