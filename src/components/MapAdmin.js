import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import { fetchMapsAsync } from '../redux/slices/dynamicMap';
import * as mapService from '../services/map.service';
import '../assets/style/ColorPalette.css';
import './MapAdmin.scss';

const MapAdmin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { maps, loading } = useSelector((state) => state.dynamicMap);
  
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showMapForm, setShowMapForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showLayerForm, setShowLayerForm] = useState(false);
  const [editingMap, setEditingMap] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingLayer, setEditingLayer] = useState(null);
  const [mapDetails, setMapDetails] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showImportLayersModal, setShowImportLayersModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importLayers, setImportLayers] = useState([]);
  const [loadingLayers, setLoadingLayers] = useState(false);
  const [selectedParentLayer, setSelectedParentLayer] = useState(null);
  const [selectedSubLayers, setSelectedSubLayers] = useState(new Set());

  // Form states
  const [mapForm, setMapForm] = useState({
    name: '',
    description: '',
    center: { lng: 118, lat: -2.5 },
    zoom: 5,
    is_public: true,
  });

  const [groupForm, setGroupForm] = useState({
    name: '',
    z_index: 0,
    is_basemap: false,
  });

  const [layerForm, setLayerForm] = useState({
    name: '',
    type: 'wms',
    url: '',
    layer_name: '',
    layer_id: '',
    style: '',
    attribution: '',
    z_index: 0,
    visible: true,
  });

  useEffect(() => {
    dispatch(fetchMapsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (selectedMap) {
      loadMapDetails(selectedMap);
    }
  }, [selectedMap]);

  const loadMapDetails = async (mapId) => {
    try {
      const response = await mapService.fetchMapById(mapId);
      setMapDetails(response.data);
    } catch (err) {
      setError(t('mapAdmin.failedToLoad'));
      console.error(err);
    }
  };

  const handleCreateMap = async (e) => {
    e.preventDefault();
    try {
      await mapService.createMap(mapForm);
      setSuccess(t('mapAdmin.mapCreated'));
      setShowMapForm(false);
      setMapForm({ name: '', description: '', center: { lng: 118, lat: -2.5 }, zoom: 5, is_public: true });
      dispatch(fetchMapsAsync());
    } catch (err) {
      setError(err.response?.data?.message || t('mapAdmin.failedToCreate'));
    }
  };

  const handleUpdateMap = async (e) => {
    e.preventDefault();
    try {
      await mapService.updateMap(editingMap.id, mapForm);
      setSuccess(t('mapAdmin.mapUpdated'));
      setShowMapForm(false);
      setEditingMap(null);
      setMapForm({ name: '', description: '', center: { lng: 118, lat: -2.5 }, zoom: 5, is_public: true });
      dispatch(fetchMapsAsync());
      if (selectedMap === editingMap.id) {
        loadMapDetails(editingMap.id);
      }
    } catch (err) {
      setError(err.response?.data?.message || t('mapAdmin.failedToUpdate'));
    }
  };

  const handleDeleteMap = async (id) => {
    if (!window.confirm(t('common.confirm') + ' ' + t('mapAdmin.deleteMap') + '?')) return;
    try {
      await mapService.deleteMap(id);
      setSuccess(t('mapAdmin.mapDeleted'));
      dispatch(fetchMapsAsync());
      if (selectedMap === id) {
        setSelectedMap(null);
        setMapDetails(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || t('mapAdmin.failedToDelete'));
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await mapService.createLayerGroup(selectedMap, groupForm);
      setSuccess(t('mapAdmin.groupCreated'));
      setShowGroupForm(false);
      setGroupForm({ name: '', z_index: 0, is_basemap: false });
      loadMapDetails(selectedMap);
    } catch (err) {
      setError(err.response?.data?.message || t('mapAdmin.failedToCreate'));
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      await mapService.updateLayerGroup(editingGroup.id, groupForm);
      setSuccess(t('mapAdmin.groupUpdated'));
      setShowGroupForm(false);
      setEditingGroup(null);
      setGroupForm({ name: '', z_index: 0, is_basemap: false });
      loadMapDetails(selectedMap);
    } catch (err) {
      setError(err.response?.data?.message || t('mapAdmin.failedToUpdate'));
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm(t('common.confirm') + ' ' + t('mapAdmin.deleteGroup') + '?')) return;
    try {
      await mapService.deleteLayerGroup(id);
      setSuccess(t('mapAdmin.groupDeleted'));
      loadMapDetails(selectedMap);
    } catch (err) {
      setError(err.response?.data?.message || t('mapAdmin.failedToDelete'));
    }
  };

  const handleCreateLayer = async (e) => {
    e.preventDefault();
    try {
      // Prepare layer data - remove empty optional fields
      const layerData = {
        name: layerForm.name,
        type: layerForm.type,
        url: layerForm.url,
        z_index: layerForm.z_index,
        visible: layerForm.visible,
      };
      
      // Add optional fields only if they have values
      if (layerForm.layer_name && layerForm.layer_name.trim() !== '') {
        layerData.layer_name = layerForm.layer_name.trim();
      }
      if (layerForm.layer_id && layerForm.layer_id.toString().trim() !== '') {
        // Convert layer_id to integer if it's a valid number, otherwise keep as string
        const layerIdValue = layerForm.layer_id.toString().trim();
        const layerIdNum = parseInt(layerIdValue, 10);
        layerData.layer_id = !isNaN(layerIdNum) ? layerIdNum : layerIdValue;
      }
      if (layerForm.style && layerForm.style.trim() !== '') {
        layerData.style = layerForm.style.trim();
      }
      if (layerForm.attribution && layerForm.attribution.trim() !== '') {
        layerData.attribution = layerForm.attribution.trim();
      }
      
      await mapService.createLayer(selectedGroup, layerData);
      setSuccess(t('mapAdmin.layerCreated'));
      setShowLayerForm(false);
      setLayerForm({ name: '', type: 'wms', url: '', layer_name: '', layer_id: '', style: '', attribution: '', z_index: 0, visible: true });
      loadMapDetails(selectedMap);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('mapAdmin.failedToCreate'));
      console.error('Error creating layer:', err);
    }
  };

  const handleUpdateLayer = async (e) => {
    e.preventDefault();
    try {
      // Prepare layer data - remove empty optional fields
      const layerData = {
        name: layerForm.name,
        type: layerForm.type,
        url: layerForm.url,
        z_index: layerForm.z_index,
        visible: layerForm.visible,
      };
      
      // Add optional fields only if they have values
      if (layerForm.layer_name && layerForm.layer_name.trim() !== '') {
        layerData.layer_name = layerForm.layer_name.trim();
      }
      if (layerForm.layer_id && layerForm.layer_id.toString().trim() !== '') {
        // Convert layer_id to integer if it's a valid number, otherwise keep as string
        const layerIdValue = layerForm.layer_id.toString().trim();
        const layerIdNum = parseInt(layerIdValue, 10);
        layerData.layer_id = !isNaN(layerIdNum) ? layerIdNum : layerIdValue;
      }
      if (layerForm.style && layerForm.style.trim() !== '') {
        layerData.style = layerForm.style.trim();
      }
      if (layerForm.attribution && layerForm.attribution.trim() !== '') {
        layerData.attribution = layerForm.attribution.trim();
      }
      
      await mapService.updateLayer(editingLayer.id, layerData);
      setSuccess(t('mapAdmin.layerUpdated'));
      setShowLayerForm(false);
      setEditingLayer(null);
      setLayerForm({ name: '', type: 'wms', url: '', layer_name: '', layer_id: '', style: '', attribution: '', z_index: 0, visible: true });
      loadMapDetails(selectedMap);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('mapAdmin.failedToUpdate'));
      console.error('Error updating layer:', err);
    }
  };

  const handleDeleteLayer = async (id) => {
    if (!window.confirm(t('common.confirm') + ' ' + t('mapAdmin.deleteLayer') + '?')) return;
    try {
      await mapService.deleteLayer(id);
      setSuccess(t('mapAdmin.layerDeleted'));
      loadMapDetails(selectedMap);
    } catch (err) {
      setError(err.response?.data?.message || t('mapAdmin.failedToDelete'));
    }
  };

  const openMapForm = (map = null) => {
    if (map) {
      setEditingMap(map);
      setMapForm({
        name: map.name,
        description: map.description || '',
        center: map.center?.coordinates 
          ? { lng: map.center.coordinates[0], lat: map.center.coordinates[1] }
          : map.center || { lng: 118, lat: -2.5 },
        zoom: map.zoom || 5,
        is_public: map.is_public !== false,
      });
    } else {
      setEditingMap(null);
      setMapForm({ name: '', description: '', center: { lng: 118, lat: -2.5 }, zoom: 5, is_public: true });
    }
    setShowMapForm(true);
  };

  const toggleGroupExpanded = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const openGroupForm = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        name: group.name,
        z_index: group.z_index || 0,
        is_basemap: group.is_basemap || false,
      });
    } else {
      setEditingGroup(null);
      setGroupForm({ name: '', z_index: 0, is_basemap: false });
    }
    setShowGroupForm(true);
  };

  const openLayerForm = (layer = null, groupId = null) => {
    if (layer) {
      setEditingLayer(layer);
      setLayerForm({
        name: layer.name,
        type: layer.type || 'wms',
        url: layer.url || '',
        layer_name: layer.layer_name || '',
        layer_id: layer.layer_id || layer.layerId || '',
        style: layer.style || '',
        attribution: layer.attribution || '',
        z_index: layer.z_index || 0,
        visible: layer.visible !== false,
      });
    } else {
      setEditingLayer(null);
      setLayerForm({ name: '', type: 'wms', url: '', layer_name: '', layer_id: '', style: '', attribution: '', z_index: 0, visible: true });
      // Set selectedGroup jika groupId diberikan
      if (groupId) {
        setSelectedGroup(groupId);
      }
    }
    setShowLayerForm(true);
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Get sub-layers of a parent layer
  const getSubLayers = useCallback((parentLayerId) => {
    if (parentLayerId === null || parentLayerId === undefined) return [];
    
    // Find parent layer
    const parentLayer = importLayers.find(l => l.id === parentLayerId);
    if (!parentLayer) {
      console.warn(`Parent layer with ID ${parentLayerId} not found`);
      return [];
    }
    
    console.log(`Getting sub-layers for parent ${parentLayerId} (${parentLayer.name}):`, {
      parentLayer,
      totalLayers: importLayers.length,
      parentSubLayerIds: parentLayer.subLayerIds
    });
    
    // Use Set to collect unique sub-layer IDs
    const subLayerIds = new Set();
    
    // Method 1: If parent has subLayerIds array, add those
    if (parentLayer.subLayerIds && Array.isArray(parentLayer.subLayerIds) && parentLayer.subLayerIds.length > 0) {
      console.log(`Parent has subLayerIds:`, parentLayer.subLayerIds);
      parentLayer.subLayerIds.forEach(id => subLayerIds.add(id));
    }
    
    // Method 2: Find layers where parentLayerId matches (ALWAYS check this)
    const byParentId = importLayers.filter(layer => layer.parentLayerId === parentLayerId);
    console.log(`Found ${byParentId.length} layers with parentLayerId = ${parentLayerId}:`, 
      byParentId.map(l => `${l.name} (${l.id}, parent: ${l.parentLayerId})`));
    byParentId.forEach(layer => subLayerIds.add(layer.id));
    
    // Convert Set to array and get full layer objects, sorted by ID
    const allSubLayers = Array.from(subLayerIds)
      .map(id => importLayers.find(l => l.id === id))
      .filter(l => l !== undefined)
      .sort((a, b) => a.id - b.id);
    
    console.log(`Total unique sub-layers found: ${allSubLayers.length}`, 
      allSubLayers.map(l => `${l.name} (${l.id})`));
    
    return allSubLayers;
  }, [importLayers]);

  // Auto-select sub-layers when parent layer is selected
  useEffect(() => {
    if (selectedParentLayer !== null && importLayers.length > 0) {
      const subLayers = getSubLayers(selectedParentLayer);
      const defaultVisibleIds = new Set(
        subLayers
          .filter(layer => layer.defaultVisibility)
          .map(layer => layer.id)
      );
      setSelectedSubLayers(defaultVisibleIds);
    }
  }, [selectedParentLayer, importLayers, getSubLayers]);

  // Fetch layers from ArcGIS MapServer
  const fetchArcGISLayers = async (mapServerUrl) => {
    try {
      setLoadingLayers(true);
      let baseUrl = mapServerUrl.trim();
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      if (!baseUrl.endsWith('MapServer')) {
        baseUrl = baseUrl.endsWith('/') ? baseUrl + 'MapServer' : baseUrl + '/MapServer';
      }

      // Fetch MapServer info with layers
      const response = await fetch(`${baseUrl}?f=json`);
      if (!response.ok) {
        throw new Error('Failed to fetch MapServer information');
      }
      
      const data = await response.json();
      
      // Extract layers from response
      let layers = data.layers || [];
      
      // If layers don't have complete subLayerIds, try to fetch individual layer info
      // This is needed for some ArcGIS services
      if (layers.length > 0) {
        const layersWithSubLayers = await Promise.all(
          layers.map(async (layer) => {
            // If layer has subLayerIds but they're empty, try to fetch layer details
            if (layer.id !== undefined && (!layer.subLayerIds || layer.subLayerIds.length === 0)) {
              try {
                const layerResponse = await fetch(`${baseUrl}/${layer.id}?f=json`);
                if (layerResponse.ok) {
                  const layerData = await layerResponse.json();
                  // Update subLayerIds if found in layer details
                  if (layerData.subLayerIds && layerData.subLayerIds.length > 0) {
                    return { ...layer, subLayerIds: layerData.subLayerIds };
                  }
                }
              } catch (err) {
                // If individual fetch fails, continue with original data
                console.warn(`Could not fetch details for layer ${layer.id}:`, err);
              }
            }
            return layer;
          })
        );
        layers = layersWithSubLayers;
      }
      
      // Format layers with proper parent/sub relationships
      const formattedLayers = layers.map((layer, index) => {
        const layerId = layer.id !== undefined ? layer.id : index;
        const parentId = layer.parentLayerId !== undefined && 
                        layer.parentLayerId !== -1 && 
                        layer.parentLayerId !== null 
                        ? layer.parentLayerId 
                        : null;
        
        return {
          id: layerId,
          name: layer.name || `Layer ${layerId}`,
          parentLayerId: parentId,
          subLayerIds: Array.isArray(layer.subLayerIds) ? layer.subLayerIds : [],
          defaultVisibility: layer.defaultVisibility !== false,
        };
      });

      // Debug: log the layers structure
      console.log('=== ArcGIS MapServer Layers ===');
      console.log('Total layers fetched:', formattedLayers.length);
      console.log('All layers:', formattedLayers.map(l => ({
        id: l.id,
        name: l.name,
        parentLayerId: l.parentLayerId,
        subLayerIds: l.subLayerIds
      })));
      
      // Check for layer 14 specifically
      const parentLayer14 = formattedLayers.find(l => l.id === 14);
      if (parentLayer14) {
        console.log('\n=== Parent Layer 14 (Sumatra [Flood]) ===');
        console.log('Parent layer:', parentLayer14);
        console.log('SubLayerIds from parent:', parentLayer14.subLayerIds);
        
        // Find all layers with parentLayerId = 14
        const byParentId = formattedLayers.filter(l => l.parentLayerId === 14);
        console.log('Layers with parentLayerId = 14:', byParentId.map(l => `${l.name} (${l.id})`));
        
        // Combine both methods
        const allSubLayers = new Set();
        if (parentLayer14.subLayerIds && parentLayer14.subLayerIds.length > 0) {
          parentLayer14.subLayerIds.forEach(id => allSubLayers.add(id));
        }
        byParentId.forEach(l => allSubLayers.add(l.id));
        
        console.log('Total unique sub-layers (combined):', Array.from(allSubLayers).map(id => {
          const l = formattedLayers.find(l => l.id === id);
          return l ? `${l.name} (${l.id})` : `ID ${id} (not found)`;
        }));
      }

      setImportLayers(formattedLayers);
      setLoadingLayers(false);
      return formattedLayers;
    } catch (err) {
      setError(`Failed to fetch layers: ${err.message}`);
      setLoadingLayers(false);
      console.error('Error fetching ArcGIS layers:', err);
      return [];
    }
  };

  // Import selected sub-layers
  const handleImportSubLayers = async (parentLayerId, subLayerIds) => {
    try {
      if (!selectedGroup) {
        setError('Please select a layer group first');
        return;
      }

      let baseUrl = importUrl.trim();
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      if (!baseUrl.endsWith('MapServer')) {
        baseUrl = baseUrl.endsWith('/') ? baseUrl + 'MapServer' : baseUrl + '/MapServer';
      }

      const parentLayer = importLayers.find(l => l.id === parentLayerId);
      if (!parentLayer) {
        setError('Parent layer not found');
        return;
      }

      console.log('Importing layers:', {
        parentLayerId,
        subLayerIds: Array.from(subLayerIds),
        baseUrl,
        selectedGroup,
        totalImportLayers: importLayers.length
      });

      // Create layers for each selected sub-layer
      const createdLayers = [];
      const failedLayers = [];
      
      for (const subLayerId of subLayerIds) {
        const subLayer = importLayers.find(l => l.id === subLayerId);
        if (subLayer) {
          const layerData = {
            name: subLayer.name,
            type: 'arcgis',
            url: baseUrl,
            layer_id: subLayer.id,
            attribution: '&copy; UNOSAT',
            z_index: createdLayers.length,
            visible: subLayer.defaultVisibility !== false,
          };

          console.log(`Creating layer: ${subLayer.name} (ID: ${subLayer.id})`, layerData);

          try {
            console.log(`Attempting to create layer:`, {
              groupId: selectedGroup,
              layerData: layerData,
              fullData: JSON.stringify(layerData, null, 2)
            });
            
            const response = await mapService.createLayer(selectedGroup, layerData);
            console.log(`✓ Layer created successfully: ${subLayer.name}`, response);
            createdLayers.push(subLayer.name);
            
            // Small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (err) {
            // Get detailed error information
            const errorResponse = err.response;
            const errorData = errorResponse?.data;
            const errorMsg = errorData?.message || errorResponse?.statusText || err.message || 'Unknown error';
            const errorDetails = errorData?.error || errorData || errorResponse?.data;
            
            console.error(`✗ Failed to create layer ${subLayer.name}:`, {
              error: err,
              response: errorResponse,
              data: errorData,
              status: errorResponse?.status,
              message: errorMsg,
              layerData: layerData
            });
            
            failedLayers.push({ 
              name: subLayer.name, 
              error: errorMsg,
              details: errorDetails
            });
          }
        } else {
          console.warn(`Sub-layer with ID ${subLayerId} not found in importLayers`);
          failedLayers.push({ name: `ID ${subLayerId}`, error: 'Layer not found in fetched layers' });
        }
      }

      console.log('Import summary:', {
        created: createdLayers.length,
        failed: failedLayers.length,
        createdLayers,
        failedLayers
      });

      if (createdLayers.length > 0) {
        const message = `Successfully imported ${createdLayers.length} layer(s): ${createdLayers.join(', ')}`;
        if (failedLayers.length > 0) {
          const failedNames = failedLayers.map(f => f.name).join(', ');
          const failedDetails = failedLayers.map(f => `${f.name}: ${f.error}`).join('; ');
          setError(`${message}. Failed (${failedLayers.length}): ${failedNames}. Details: ${failedDetails}`);
        } else {
          setSuccess(message);
        }
        setShowImportLayersModal(false);
        setImportUrl('');
        setImportLayers([]);
        setSelectedParentLayer(null);
        setSelectedSubLayers(new Set());
        loadMapDetails(selectedMap);
      } else {
        const errorDetails = failedLayers.map(f => {
          const details = f.details ? ` (${JSON.stringify(f.details)})` : '';
          return `${f.name}: ${f.error}${details}`;
        }).join('; ');
        
        const errorMsg = failedLayers.length > 0 
          ? `No layers were created. Errors: ${errorDetails}. Please check the browser console for more details.`
          : 'No layers were created. Please check the console for details.';
        setError(errorMsg);
      }
    } catch (err) {
      setError(`Failed to import layers: ${err.message}`);
      console.error('Error importing layers:', err);
    }
  };

  return (
    <main className="map-admin-page">
      <div className="map-admin-container">
        <h1>{t('mapAdmin.title')}</h1>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Maps Section */}
        {!selectedMap && (
          <div className="tab-content">
            <div className="section-header">
              <h2>{t('mapAdmin.title')}</h2>
              <button className="btn-primary" onClick={() => openMapForm()}>
                + {t('mapAdmin.createMap')}
              </button>
            </div>

            {loading ? (
              <div className="loading">{t('common.loading')}</div>
            ) : (
              <div className="maps-list">
                {maps && maps.length > 0 ? (
                  maps.map((map) => (
                    <div
                      key={map.id}
                      className={`map-card ${selectedMap === map.id ? 'selected' : ''}`}
                      onClick={() => setSelectedMap(map.id)}
                    >
                      <div className="card-header">
                        <h3>{map.name}</h3>
                        {map.is_public && <span className="badge">{t('mapAdmin.public')}</span>}
                      </div>
                      <div className="card-info">
                        <p><strong>{t('maps.zoom')}:</strong> {map.zoom}</p>
                        {map.center && (
                          <p>
                            <strong>{t('maps.center')}:</strong>{' '}
                            {map.center.coordinates
                              ? `${map.center.coordinates[1].toFixed(4)}, ${map.center.coordinates[0].toFixed(4)}`
                              : `${map.center.lat?.toFixed(4)}, ${map.center.lng?.toFixed(4)}`}
                          </p>
                        )}
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn-view"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dynamic-maps/${map.id}`);
                          }}
                        >
                          {t('mapAdmin.viewMap')}
                        </button>
                        <button
                          className="btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMapForm(map);
                          }}
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          className="btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMap(map.id);
                          }}
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">{t('mapAdmin.noMaps')}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Map Details with Layer Groups and Layers */}
        {selectedMap && mapDetails && (
          <div className="tab-content">
            <div className="map-details-header">
              <div className="map-details-title">
                <h2>{mapDetails.name}</h2>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedMap(null);
                    setSelectedGroup(null);
                    setMapDetails(null);
                    setExpandedGroups({});
                  }}
                >
                  ← {t('common.back')}
                </button>
              </div>
              {mapDetails.description && (
                <p className="map-description">{mapDetails.description}</p>
              )}
              <div className="map-details-actions">
                <button className="btn-primary" onClick={() => openMapForm(mapDetails)}>
                  {t('mapAdmin.editMap')}
                </button>
                <button className="btn-view" onClick={() => navigate(`/dynamic-maps/${selectedMap}`)}>
                  {t('mapAdmin.viewMap')}
                </button>
              </div>
            </div>

            {/* Layer Groups Section */}
            <div className="layer-groups-section">
              <div className="section-header">
                <h3>{t('mapAdmin.layerGroups')}</h3>
                <button className="btn-primary" onClick={() => openGroupForm()}>
                  + {t('mapAdmin.createGroup')}
                </button>
              </div>

              {mapDetails.layer_groups && mapDetails.layer_groups.length > 0 ? (
                <div className="groups-list-expanded">
                  {mapDetails.layer_groups.map((group) => (
                    <div key={group.id} className="group-card-expanded">
                      <div 
                        className="group-header-expanded"
                        onClick={() => toggleGroupExpanded(group.id)}
                      >
                        <div className="group-title">
                          <span className="expand-icon">{expandedGroups[group.id] ? '▼' : '▶'}</span>
                          <h4>{group.name}</h4>
                          {group.is_basemap && <span className="badge">{t('maps.basemap')}</span>}
                        </div>
                        <div className="group-info-inline">
                          <span>{t('mapAdmin.zIndex')}: {group.z_index}</span>
                          <span>{t('mapAdmin.layers')}: {group.layers?.length || 0}</span>
                        </div>
                        <div className="group-actions-inline">
                          <button
                            className="btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              openGroupForm(group);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(group.id);
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                      
                      {expandedGroups[group.id] && (
                        <div className="layers-container">
                          <div className="layers-header">
                            <h5>{t('mapAdmin.layers')}</h5>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button 
                                className="btn-primary btn-small"
                                onClick={() => {
                                  setSelectedGroup(group.id);
                                  setShowImportLayersModal(true);
                                }}
                                title="Import layers from ArcGIS MapServer"
                              >
                                📥 Import from ArcGIS
                              </button>
                              <button 
                                className="btn-primary btn-small"
                                onClick={() => openLayerForm(null, group.id)}
                              >
                                + {t('mapAdmin.createLayer')}
                              </button>
                            </div>
                          </div>
                          
                          {group.layers && group.layers.length > 0 ? (
                            <div className="layers-list-inline">
                              {group.layers.map((layer) => (
                                <div key={layer.id} className="layer-card-inline">
                                  <div className="layer-header-inline">
                                    <div className="layer-title">
                                      <h5>{layer.name}</h5>
                                      <span className="badge badge-type">{layer.type.toUpperCase()}</span>
                                    </div>
                                    <div className="layer-actions-inline">
                                      <button
                                        className="btn-edit"
                                        onClick={() => openLayerForm(layer)}
                                      >
                                        {t('common.edit')}
                                      </button>
                                      <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteLayer(layer.id)}
                                      >
                                        {t('common.delete')}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="layer-info-inline">
                                    <p><strong>{t('mapAdmin.url')}:</strong> {layer.url}</p>
                                    {layer.layer_name && <p><strong>{t('mapAdmin.layerName')}:</strong> {layer.layer_name}</p>}
                                    {(layer.layer_id || layer.layerId) && <p><strong>Layer ID:</strong> {layer.layer_id || layer.layerId}</p>}
                                    {layer.attribution && <p><strong>Attribution:</strong> {layer.attribution}</p>}
                                    <p><strong>{t('mapAdmin.zIndex')}:</strong> {layer.z_index} | <strong>{t('mapAdmin.visible')}:</strong> {layer.visible ? t('common.yes') : t('common.no')}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-state-small">{t('mapAdmin.noLayers')}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">{t('mapAdmin.noGroups')}</div>
              )}
            </div>
          </div>
        )}

        {/* Map Form Modal */}
        {showMapForm && (
          <div className="modal-overlay" onClick={() => setShowMapForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingMap ? t('mapAdmin.editMap') : t('mapAdmin.createMap')}</h2>
              <form onSubmit={editingMap ? handleUpdateMap : handleCreateMap}>
                <div className="form-group">
                  <label>{t('mapAdmin.name')} *</label>
                  <input
                    type="text"
                    value={mapForm.name}
                    onChange={(e) => setMapForm({ ...mapForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('mapAdmin.description')}</label>
                  <textarea
                    value={mapForm.description}
                    onChange={(e) => setMapForm({ ...mapForm, description: e.target.value })}
                    placeholder={t('mapAdmin.description')}
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Longitude ({t('mapAdmin.center')}) *</label>
                    <input
                      type="number"
                      step="any"
                      value={mapForm.center.lng}
                      onChange={(e) => setMapForm({
                        ...mapForm,
                        center: { ...mapForm.center, lng: parseFloat(e.target.value) }
                      })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Latitude ({t('mapAdmin.center')}) *</label>
                    <input
                      type="number"
                      step="any"
                      value={mapForm.center.lat}
                      onChange={(e) => setMapForm({
                        ...mapForm,
                        center: { ...mapForm.center, lat: parseFloat(e.target.value) }
                      })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Zoom Level *</label>
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={mapForm.zoom}
                    onChange={(e) => setMapForm({ ...mapForm, zoom: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={mapForm.is_public}
                      onChange={(e) => setMapForm({ ...mapForm, is_public: e.target.checked })}
                    />
                    {t('mapAdmin.public')}
                  </label>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowMapForm(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingMap ? t('common.save') : t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Group Form Modal */}
        {showGroupForm && (
          <div className="modal-overlay" onClick={() => setShowGroupForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingGroup ? 'Edit Layer Group' : 'Tambah Layer Group'}</h2>
              <form onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}>
                <div className="form-group">
                  <label>{t('mapAdmin.name')} *</label>
                  <input
                    type="text"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('mapAdmin.zIndex')}</label>
                  <input
                    type="number"
                    value={groupForm.z_index}
                    onChange={(e) => setGroupForm({ ...groupForm, z_index: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={groupForm.is_basemap}
                      onChange={(e) => setGroupForm({ ...groupForm, is_basemap: e.target.checked })}
                    />
                    {t('maps.basemap')}
                  </label>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowGroupForm(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingGroup ? t('common.save') : t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Layer Form Modal */}
        {showLayerForm && (
          <div className="modal-overlay" onClick={() => setShowLayerForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingLayer ? t('mapAdmin.editLayer') : t('mapAdmin.createLayer')}</h2>
              <form onSubmit={editingLayer ? handleUpdateLayer : handleCreateLayer}>
                <div className="form-group">
                  <label>{t('mapAdmin.layerName')} *</label>
                  <input
                    type="text"
                    value={layerForm.name}
                    onChange={(e) => setLayerForm({ ...layerForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('mapAdmin.layerType')} *</label>
                  <select
                    value={layerForm.type}
                    onChange={(e) => setLayerForm({ ...layerForm, type: e.target.value })}
                    required
                  >
                    <option value="wms">WMS</option>
                    <option value="wfs">WFS</option>
                    <option value="xyz">XYZ</option>
                    <option value="mvt">MVT</option>
                    <option value="geojson">GeoJSON</option>
                    <option value="arcgis">ArcGIS MapServer</option>
                    <option value="mapserver">MapServer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('mapAdmin.url')} *</label>
                  <input
                    type="text"
                    value={layerForm.url}
                    onChange={(e) => setLayerForm({ ...layerForm, url: e.target.value })}
                    required
                    placeholder={
                      layerForm.type === 'arcgis' || layerForm.type === 'mapserver'
                        ? "https://example.com/rest/services/ServiceName/MapServer"
                        : layerForm.type === 'mvt'
                        ? "https://example.com/tiles/{z}/{x}/{y}.pbf"
                        : "https://example.com/wms"
                    }
                  />
                </div>
                {(layerForm.type === 'wms' || layerForm.type === 'wfs') && (
                  <div className="form-group">
                    <label>{t('mapAdmin.layerName')} (untuk WMS/WFS)</label>
                    <input
                      type="text"
                      value={layerForm.layer_name}
                      onChange={(e) => setLayerForm({ ...layerForm, layer_name: e.target.value })}
                      placeholder="layer_name"
                    />
                  </div>
                )}
                {(layerForm.type === 'arcgis' || layerForm.type === 'mapserver') && (
                  <div className="form-group">
                    <label>Layer ID (opsional - untuk layer spesifik dalam MapServer)</label>
                    <input
                      type="text"
                      value={layerForm.layer_id}
                      onChange={(e) => setLayerForm({ ...layerForm, layer_id: e.target.value })}
                      placeholder="0 atau kosongkan untuk semua layer"
                    />
                    <small style={{ color: '#666', fontSize: '0.9em' }}>
                      Kosongkan untuk menampilkan semua layer, atau masukkan ID layer spesifik (contoh: 0, 1, 2)
                    </small>
                  </div>
                )}
                {(layerForm.type === 'arcgis' || layerForm.type === 'mapserver') && (
                  <div className="form-group">
                    <label>Attribution (opsional)</label>
                    <input
                      type="text"
                      value={layerForm.attribution}
                      onChange={(e) => setLayerForm({ ...layerForm, attribution: e.target.value })}
                      placeholder="&copy; Esri atau &copy; UNOSAT"
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>{t('mapAdmin.style')}</label>
                  <textarea
                    value={layerForm.style}
                    onChange={(e) => setLayerForm({ ...layerForm, style: e.target.value })}
                    placeholder={
                      layerForm.type === 'mvt'
                        ? '{"color": "#3388ff", "weight": 2, "fillColor": "#3388ff", "fillOpacity": 0.3, "opacity": 0.7}'
                        : '{"color": "#3388ff", "weight": 2}'
                    }
                    rows="5"
                  />
                  {layerForm.type === 'mvt' && (
                    <small style={{ color: '#666', fontSize: '0.9em', display: 'block', marginTop: '5px' }}>
                      MVT Style: color (stroke), weight (stroke width), fillColor, fillOpacity, opacity. 
                      Example: {"{"}"color": "#ff0000", "weight": 2, "fillColor": "#ff0000", "fillOpacity": 0.2{"}"}
                    </small>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('mapAdmin.zIndex')}</label>
                    <input
                      type="number"
                      value={layerForm.z_index}
                      onChange={(e) => setLayerForm({ ...layerForm, z_index: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={layerForm.visible}
                        onChange={(e) => setLayerForm({ ...layerForm, visible: e.target.checked })}
                      />
                      {t('mapAdmin.visible')}
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowLayerForm(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn-primary">
                    {t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Import Layers from ArcGIS Modal */}
        {showImportLayersModal && (
          <div className="modal-overlay" onClick={() => setShowImportLayersModal(false)}>
            <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <h2>Import Layers from ArcGIS MapServer</h2>
              
              <div className="form-group">
                <label>MapServer URL *</label>
                <input
                  type="text"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://unosatgis.cern.ch/rapidmapping/rest/services/LS20251118IDN/UNOSAT_analysis/MapServer"
                  style={{ width: '100%' }}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    if (importUrl) {
                      fetchArcGISLayers(importUrl);
                    }
                  }}
                  disabled={loadingLayers || !importUrl}
                  style={{ marginTop: '10px' }}
                >
                  {loadingLayers ? 'Loading...' : 'Fetch Layers'}
                </button>
              </div>

              {importLayers.length > 0 && (
                <div className="form-group">
                  <label>Select Parent Layer</label>
                  <select
                    value={selectedParentLayer !== null ? selectedParentLayer : ''}
                    onChange={(e) => {
                      const parentId = e.target.value === '' ? null : parseInt(e.target.value, 10);
                      setSelectedParentLayer(parentId);
                      if (parentId === null) {
                        setSelectedSubLayers(new Set());
                      }
                    }}
                    style={{ width: '100%', marginBottom: '15px' }}
                  >
                    <option value="">-- Select Parent Layer --</option>
                    {importLayers
                      .filter(layer => {
                        // Show layers that are top-level (no parent) OR have subLayerIds (parent layers)
                        return (layer.parentLayerId === null || layer.parentLayerId === -1) || 
                               (layer.subLayerIds && layer.subLayerIds.length > 0);
                      })
                      .map(layer => (
                        <option key={layer.id} value={layer.id}>
                          {layer.name} (ID: {layer.id}){layer.subLayerIds && layer.subLayerIds.length > 0 ? ` - ${layer.subLayerIds.length} sub-layers` : ''}
                        </option>
                      ))}
                  </select>

                  {selectedParentLayer !== null && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label>
                          <strong>Select Sub-Layers to Import:</strong>
                        </label>
                        <button
                          type="button"
                          className="btn-secondary btn-small"
                          onClick={() => {
                            const subLayers = getSubLayers(selectedParentLayer);
                            const allIds = new Set(subLayers.map(l => l.id));
                            setSelectedSubLayers(allIds);
                          }}
                        >
                          Select All
                        </button>
                      </div>
                      <div style={{ 
                        maxHeight: '300px', 
                        overflowY: 'auto', 
                        border: '1px solid #ddd', 
                        padding: '10px',
                        marginTop: '10px',
                        borderRadius: '4px'
                      }}>
                        {getSubLayers(selectedParentLayer).length > 0 ? (
                          getSubLayers(selectedParentLayer).map(subLayer => (
                            <label key={subLayer.id} style={{ display: 'block', marginBottom: '8px' }}>
                              <input
                                type="checkbox"
                                checked={selectedSubLayers.has(subLayer.id)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedSubLayers);
                                  if (e.target.checked) {
                                    newSelected.add(subLayer.id);
                                  } else {
                                    newSelected.delete(subLayer.id);
                                  }
                                  setSelectedSubLayers(newSelected);
                                }}
                              />
                              <span style={{ marginLeft: '8px' }}>
                                {subLayer.name} (ID: {subLayer.id})
                              </span>
                            </label>
                          ))
                        ) : (
                          <p style={{ color: '#666', fontStyle: 'italic' }}>
                            No sub-layers found for this parent layer.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowImportLayersModal(false);
                    setImportUrl('');
                    setImportLayers([]);
                    setSelectedParentLayer(null);
                    setSelectedSubLayers(new Set());
                  }}
                >
                  {t('common.cancel')}
                </button>
                {selectedParentLayer !== null && getSubLayers(selectedParentLayer).length > 0 && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      const selectedIds = Array.from(selectedSubLayers);
                      
                      console.log('Import button clicked:', {
                        selectedParentLayer,
                        selectedIds,
                        selectedCount: selectedIds.length,
                        allSubLayers: getSubLayers(selectedParentLayer).map(l => ({ id: l.id, name: l.name }))
                      });
                      
                      if (selectedIds.length > 0) {
                        handleImportSubLayers(selectedParentLayer, selectedIds);
                      } else {
                        setError('Please select at least one sub-layer to import');
                      }
                    }}
                  >
                    Import Selected Layers ({selectedSubLayers.size})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MapAdmin;

