import axiosInstance from '../api/axios';

/**
 * Product Service
 * Handles all product-related API calls
 */

/**
 * Fetch products with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 100)
 * @param {string} params.region - Region filter (optional)
 * @param {string} params.category - Category filter (optional)
 * @returns {Promise} API response
 */
export const fetchProducts = async (params = {}) => {
  const queryParams = {
    page: params.page || 1,
    limit: params.limit || 100,
  };

  // Add optional filters
  if (params.region && params.region.trim() !== '') {
    queryParams.region = params.region.trim();
  }
  if (params.category && params.category !== 'Semua kejadian') {
    queryParams.category = params.category;
  }

  const response = await axiosInstance.get('/products', {
    params: queryParams,
  });

  return response.data;
};

/**
 * Transform product data from API to component format
 * @param {Object} product - Raw product data from API
 * @returns {Object} Transformed product data
 */
export const transformProduct = (product) => {
  const thumbnailUrl = product.thumbnail
    ? `${process.env.REACT_APP_API_URL || ''}/products/${product.id}/preview`
    : null;

  const releaseDate = product.date ? new Date(product.date) : new Date();

  return {
    id: product.id,
    thumbnail: thumbnailUrl,
    title: product.title || 'Untitled',
    date: product.date || '',
    releaseDate: releaseDate,
    filename: product.filename || '',
    category: product.category || 'Unknown',
  };
};

/**
 * Transform array of products from API
 * @param {Array} products - Array of raw product data from API
 * @returns {Array} Array of transformed product data
 */
export const transformProducts = (products) => {
  return products.map(transformProduct);
};

/**
 * Get download URL for a product
 * @param {number|string} productId - Product ID
 * @returns {string} Download URL
 */
export const getDownloadUrl = (productId) => {
  return `${process.env.REACT_APP_API_URL || ''}/products/${productId}/download`;
};

/**
 * Get preview URL for a product
 * @param {number|string} productId - Product ID
 * @returns {string} Preview URL
 */
export const getPreviewUrl = (productId) => {
  return `${process.env.REACT_APP_API_URL || ''}/products/${productId}/preview`;
};

