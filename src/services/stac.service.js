import stacAxios from '../api/stacAxios';

/**
 * Extract readable message from STAC/FastAPI error responses
 */
export const extractStacError = (error) => {
  const data = error?.response?.data;
  if (data?.detail && Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg).filter(Boolean).join('; ');
  }
  if (typeof data?.detail === 'string') {
    return data.detail;
  }
  return data?.message || error?.message || 'Request failed';
};

/**
 * Normalize bbox to STAC format [minx, miny, maxx, maxy]
 */
export const normalizeBbox = (bbox) => {
  if (!Array.isArray(bbox) || bbox.length !== 4) return null;

  let [minX, minY, maxX, maxY] = bbox.map(Number);
  if (![minX, minY, maxX, maxY].every(Number.isFinite)) return null;

  minX = Math.max(-180, Math.min(180, minX));
  maxX = Math.max(-180, Math.min(180, maxX));
  minY = Math.max(-90, Math.min(90, minY));
  maxY = Math.max(-90, Math.min(90, maxY));

  if (minX > maxX) [minX, maxX] = [maxX, minX];
  if (minY > maxY) [minY, maxY] = [maxY, minY];

  return [minX, minY, maxX, maxY];
};

/**
 * Fetch STAC Collections
 */
export const fetchCollections = async () => {
  const response = await stacAxios.get('/collections');
  return response.data;
};

/**
 * Fetch a specific STAC Collection
 */
export const fetchCollection = async (collectionId) => {
  const response = await stacAxios.get(`/collections/${collectionId}`);
  return response.data;
};

/**
 * Search STAC Items
 */
export const searchItems = async (params = {}) => {
  const searchParams = {
    limit: params.limit || 100,
  };

  const bbox = normalizeBbox(params.bbox);
  if (bbox) {
    searchParams.bbox = bbox;
  }

  if (params.intersects) {
    searchParams.intersects = params.intersects;
  }

  if (params.datetime) {
    searchParams.datetime = params.datetime;
  }

  if (params.collections && Array.isArray(params.collections) && params.collections.length > 0) {
    searchParams.collections = params.collections;
  }

  if (params.next) {
    searchParams.next = params.next;
  }

  const response = await stacAxios.post('/search', searchParams, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

/**
 * Convert Leaflet bounds to STAC bbox [minx, miny, maxx, maxy]
 */
export const boundsToBbox = (bounds) => {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return normalizeBbox([sw.lng, sw.lat, ne.lng, ne.lat]);
};

/**
 * Format date range for STAC datetime parameter
 */
export const formatDateRange = (startDate, endDate) => {
  let start = null;
  let end = null;

  if (startDate) {
    const startDateObj =
      startDate instanceof Date ? new Date(startDate.getTime()) : new Date(startDate);
    if (Number.isNaN(startDateObj.getTime())) return null;
    start = startDateObj.toISOString();
  }

  if (endDate) {
    const endDateObj =
      endDate instanceof Date ? new Date(endDate.getTime()) : new Date(endDate);
    if (Number.isNaN(endDateObj.getTime())) return null;
    endDateObj.setHours(23, 59, 59, 999);
    end = endDateObj.toISOString();
  }

  if (start && end && new Date(start) > new Date(end)) {
    return null;
  }

  if (start && end) return `${start}/${end}`;
  if (start) return `${start}/..`;
  if (end) return `../${end}`;
  return null;
};

/**
 * Get asset URL from STAC Item
 */
export const getAssetUrl = (item, assetKey) => {
  if (!item?.assets?.[assetKey]) return null;
  const asset = item.assets[assetKey];
  return typeof asset === 'string' ? asset : asset.href;
};
