import axiosInstance from '../api/axios';

/**
 * Map Service
 * Handles all map-related API calls
 */

/**
 * Fetch all maps
 * @returns {Promise} API response
 */
export const fetchMaps = async () => {
  const response = await axiosInstance.get('/maps');
  // Return the full response to handle both { status, code, data } and direct data
  return response.data;
};

/**
 * Fetch map by ID with all layer groups and layers
 * @param {number|string} mapId - Map ID
 * @returns {Promise} API response
 */
export const fetchMapById = async (mapId) => {
  const response = await axiosInstance.get(`/maps/${mapId}`);
  return response.data;
};

/**
 * Create a new map
 * @param {Object} mapData - Map data
 * @param {string} mapData.name - Map name
 * @param {Object} mapData.center - Center coordinates {lng, lat} or {coordinates: [lng, lat]}
 * @param {number} mapData.zoom - Zoom level
 * @param {boolean} mapData.is_public - Is public
 * @returns {Promise} API response
 */
export const createMap = async (mapData) => {
  const response = await axiosInstance.post('/maps', mapData);
  return response.data;
};

/**
 * Update map
 * @param {number|string} mapId - Map ID
 * @param {Object} mapData - Map data to update
 * @returns {Promise} API response
 */
export const updateMap = async (mapId, mapData) => {
  const response = await axiosInstance.put(`/maps/${mapId}`, mapData);
  return response.data;
};

/**
 * Delete map
 * @param {number|string} mapId - Map ID
 * @returns {Promise} API response
 */
export const deleteMap = async (mapId) => {
  const response = await axiosInstance.delete(`/maps/${mapId}`);
  return response.data;
};

/**
 * Create layer group
 * @param {number|string} mapId - Map ID
 * @param {Object} groupData - Layer group data
 * @param {string} groupData.name - Group name
 * @param {number} groupData.z_index - Z-index
 * @param {boolean} groupData.is_basemap - Is basemap
 * @returns {Promise} API response
 */
export const createLayerGroup = async (mapId, groupData) => {
  const response = await axiosInstance.post(`/maps/${mapId}/layer-groups`, groupData);
  return response.data;
};

/**
 * Update layer group
 * @param {number|string} groupId - Layer group ID
 * @param {Object} groupData - Layer group data to update
 * @returns {Promise} API response
 */
export const updateLayerGroup = async (groupId, groupData) => {
  const response = await axiosInstance.put(`/maps/layer-groups/${groupId}`, groupData);
  return response.data;
};

/**
 * Delete layer group
 * @param {number|string} groupId - Layer group ID
 * @returns {Promise} API response
 */
export const deleteLayerGroup = async (groupId) => {
  const response = await axiosInstance.delete(`/maps/layer-groups/${groupId}`);
  return response.data;
};

/**
 * Create layer
 * @param {number|string} groupId - Layer group ID
 * @param {Object} layerData - Layer data
 * @param {string} layerData.name - Layer name
 * @param {string} layerData.type - Layer type (wms, wfs, xyz, mvt, geojson)
 * @param {string} layerData.url - Layer URL
 * @param {string} layerData.layer_name - Layer name for WMS/WFS
 * @param {string} layerData.style - Layer style
 * @param {number} layerData.z_index - Z-index
 * @param {boolean} layerData.visible - Is visible
 * @returns {Promise} API response
 */
export const createLayer = async (groupId, layerData) => {
  const response = await axiosInstance.post(`/maps/layer-groups/${groupId}/layers`, layerData);
  return response.data;
};

/**
 * Update layer
 * @param {number|string} layerId - Layer ID
 * @param {Object} layerData - Layer data to update
 * @returns {Promise} API response
 */
export const updateLayer = async (layerId, layerData) => {
  const response = await axiosInstance.put(`/maps/layers/${layerId}`, layerData);
  return response.data;
};

/**
 * Delete layer
 * @param {number|string} layerId - Layer ID
 * @returns {Promise} API response
 */
export const deleteLayer = async (layerId) => {
  const response = await axiosInstance.delete(`/maps/layers/${layerId}`);
  return response.data;
};

