import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    messages: [],
    loading: false,
    error: null
};

const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        removeMessage: (state, action) => {
            state.messages = state.messages.filter(
                (msg) => msg.id !== action.payload
            );
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearMessages: (state) => {
            state.messages = [];
            state.error = null;
        }
    }
});

export const { setMessages, addMessage, removeMessage, setLoading, setError, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
