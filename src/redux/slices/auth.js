import { createSlice } from '@reduxjs/toolkit';
import {
    REGISTER_SUCCESS,
    REGISTER_FAILURE,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGOUT,
    CHECK_AUTH,
    GET_ROLES
} from '../../actions/types';
import { clearAuth, loadAuth, saveAuth } from '../../utils/authSession';

const emptyState = {
    isAuthenticated: false,
    user: null,
    roles: [],
    loading: false,
    error: null
};

const savedAuth = loadAuth();
const initialState = savedAuth?.isAuthenticated
    ? {
        ...emptyState,
        isAuthenticated: true,
        user: savedAuth.user || null,
        roles: savedAuth.roles || [],
    }
    : emptyState;

const persist = (state) => {
    if (!state.isAuthenticated) {
        clearAuth();
        return;
    }
    saveAuth({
        isAuthenticated: true,
        user: state.user,
        roles: state.roles,
    });
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setRoles: (state, action) => {
            state.roles = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.roles = [action.payload.role];
            state.error = null;
            persist(state);
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.roles = [];
            state.error = null;
            persist(state);
        }
    }
});

export const { setAuthenticated, setUser, setRoles, setLoading, setError, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
