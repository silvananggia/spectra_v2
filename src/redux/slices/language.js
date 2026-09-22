import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLanguage: localStorage.getItem('spectra-language') || 'id', // 'id' or 'en'
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
      localStorage.setItem('spectra-language', action.payload);
    },
    toggleLanguage: (state) => {
      state.currentLanguage = state.currentLanguage === 'id' ? 'en' : 'id';
      localStorage.setItem('spectra-language', state.currentLanguage);
    },
  },
});

export const { setLanguage, toggleLanguage } = languageSlice.actions;
export default languageSlice.reducer;

