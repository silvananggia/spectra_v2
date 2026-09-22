import axios from 'axios';

/**
 * Axios instance for STAC API
 */
export default axios.create({
  baseURL: process.env.REACT_APP_STAC_URL || 'https://spectra.brin.go.id/stac',
  headers: {
    'Content-Type': 'application/json',
  },
});
