import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMapByIdAsync, toggleLayerVisibility, setLayerOpacity, setSelectedBasemap, showAllLayers, hideAllLayers } from '../redux/slices/dynamicMap';
import { useTranslation } from '../utils/i18n';
import Skeleton from './Skeleton';
import StacCatalogPanel from './StacCatalogPanel';
import { StacExtentsLayer, StacImageryLayer, MapExtentTracker } from './stacMapLayers';
import { CARTO_GREY_ATTRIBUTION, CARTO_GREY_LABELS_URL_LEAFLET, CARTO_GREY_URL_LEAFLET } from '../utils/basemap';
import '../assets/style/ColorPalette.css';
import './DynamicMap.scss';
import './StacCatalog.scss';

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || '';

const cartoGreyBasemap = {
  name: 'Carto Grey',
  url: CARTO_GREY_URL_LEAFLET,
  overlayUrl: CARTO_GREY_LABELS_URL_LEAFLET,
  attribution: CARTO_GREY_ATTRIBUTION,
  tileOptions: { maxZoom: 16 }
};

const BASEMAPS = {
  carto: cartoGreyBasemap,
  google: {
    name: 'Google Satellite with Labels',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google'
  },
  terrain: {
    name: 'Google Terrain',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google'
  },
  esri: {
    name: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

if (MAPBOX_ACCESS_TOKEN) {
  BASEMAPS.mapbox = {
    name: 'Mapbox Light',
    url: `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
    tileOptions: { tileSize: 512, zoomOffset: -1, maxZoom: 22 }
  };
}

// WMS Layer Component
const WMSTileLayer = ({ url, layerName, opacity = 0.7, visible = true, zIndex = 100 }) => {
  const map = useMap();
  const layerRef = useRef(null);

  // Create layer only when URL or layerName changes (not when visible/opacity changes)
  useEffect(() => {
    // Remove existing layer if any
    if (layerRef.current && map.hasLayer(layerRef.current)) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (!url || !layerName) return;

    try {
      const wmsLayer = L.tileLayer.wms(url, {
        layers: layerName,
        format: 'image/png',
        transparent: true,
        opacity: opacity,
        version: '1.1.0',
        zIndex: zIndex,
        crossOrigin: true // Enable CORS for cross-origin requests
      });

      layerRef.current = wmsLayer;
      
      // Only add to map if visible
      if (visible) {
        wmsLayer.addTo(map);
      }
    } catch (error) {
      console.error('Error creating WMS layer:', error);
    }

    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, url, layerName, zIndex]); // Removed visible and opacity from dependencies

  // Handle visibility changes separately
  useEffect(() => {
    if (!layerRef.current) return;

    if (visible) {
      if (!map.hasLayer(layerRef.current)) {
        layerRef.current.addTo(map);
      }
    } else {
      if (map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
      }
    }
  }, [map, visible]);

  // Handle opacity changes separately
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setOpacity(opacity);
    }
  }, [opacity]);

  return null;
};

// XYZ Tile Layer Component
const XYZTileLayer = ({ url, opacity = 0.7, visible = true, zIndex = 100, attribution = '' }) => {
  const map = useMap();
  const layerRef = useRef(null);

  // Create layer only when URL changes (not when visible/opacity changes)
  useEffect(() => {
    // Remove existing layer if any
    if (layerRef.current && map.hasLayer(layerRef.current)) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (!url) return;

    try {
      // gdal2tiles generates TMS format tiles (Y coordinate needs to be flipped)
      // Check if URL is from spectra.brin.go.id/tiles (gdal2tiles output)
      const isTMS = url.includes('spectra.brin.go.id/tiles') || 
                    url.includes('/tiles/') && !url.includes('tms=false');
      
      const xyzLayer = L.tileLayer(url, {
        attribution: attribution || '',
        opacity: opacity,
        zIndex: zIndex,
        maxZoom: 19,
        minZoom: 0,
        crossOrigin: true, // Enable CORS for cross-origin requests
        tms: isTMS // Enable TMS format for gdal2tiles (flips Y coordinate)
      });
      
      if (isTMS) {
        console.log('Using TMS format for tile layer:', url);
      }

      layerRef.current = xyzLayer;
      
      // Add error handling for tile loading
      xyzLayer.on('tileerror', function(error, tile) {
        console.warn('XYZ tile error:', {
          url: tile?.src || url,
          error: error,
          isTMS: isTMS
        });
      });
      
      // Only add to map if visible
      if (visible) {
        xyzLayer.addTo(map);
        console.log('XYZ layer added to map:', {
          url: url,
          isTMS: isTMS,
          visible: visible
        });
      }
    } catch (error) {
      console.error('Error creating XYZ layer:', error);
    }

    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, url, zIndex, attribution]); // Removed visible and opacity from dependencies

  // Handle visibility changes separately
  useEffect(() => {
    if (!layerRef.current) return;

    if (visible) {
      if (!map.hasLayer(layerRef.current)) {
        layerRef.current.addTo(map);
      }
    } else {
      if (map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
      }
    }
  }, [map, visible]);

  // Handle opacity changes separately
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setOpacity(opacity);
    }
  }, [opacity]);

  return null;
};

// ArcGIS MapServer Layer Component
// Uses L.esri.dynamicMapLayer for better ArcGIS MapServer support
const ArcGISMapServerLayer = ({ url, layerId, opacity = 0.7, visible = true, zIndex = 100, attribution = '' }) => {
  const map = useMap();
  const layerRef = useRef(null);

  // Create layer only when URL or layerId changes (not when visible/opacity changes)
  useEffect(() => {
    // Wait for Esri Leaflet to be loaded with max retries
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max (50 * 100ms)
    
    const checkAndCreateLayer = () => {
      // Check if Esri Leaflet is loaded
      if (!window.L || !window.L.esri || !window.L.esri.dynamicMapLayer) {
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(checkAndCreateLayer, 100);
        } else {
          console.error('Esri Leaflet failed to load after', maxRetries, 'retries');
        }
        return;
      }

      // Remove existing layer if any
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }

      try {
        // Clean up URL - ensure it ends with MapServer
        let baseUrl = url.trim();
        if (baseUrl.endsWith('/')) {
          baseUrl = baseUrl.slice(0, -1);
        }
        if (!baseUrl.endsWith('MapServer')) {
          baseUrl = baseUrl.endsWith('/') ? baseUrl + 'MapServer' : baseUrl + '/MapServer';
        }

        // Create dynamic map layer options
        const layerOptions = {
          opacity: opacity,
          zIndex: zIndex,
          attribution: attribution || '&copy; Esri',
          useCors: true, // Enable CORS for cross-origin requests
        };

        // If layerId is specified, show only that layer
        if (layerId !== undefined && layerId !== null && layerId !== '') {
          layerOptions.layers = [parseInt(layerId, 10)]; // Array of layer IDs to show (must be integers)
        }

        // Create Esri dynamic map layer
        const arcgisLayer = L.esri.dynamicMapLayer({
          url: baseUrl,
          ...layerOptions
        });

        // Add error handling
        arcgisLayer.on('error', function(e) {
          console.error('ArcGIS MapServer layer error:', e);
        });

        layerRef.current = arcgisLayer;
        
        // Only add to map if visible
        if (visible) {
          arcgisLayer.addTo(map);
        }
      } catch (error) {
        console.error('Error creating ArcGIS MapServer layer:', error);
      }
    };

    checkAndCreateLayer();

    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, url, layerId, zIndex, attribution]); // Removed visible and opacity from dependencies

  // Handle visibility changes separately
  useEffect(() => {
    if (!layerRef.current) return;

    if (visible) {
      if (!map.hasLayer(layerRef.current)) {
        layerRef.current.addTo(map);
      }
    } else {
      if (map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
      }
    }
  }, [map, visible]);

  // Handle opacity changes separately
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setOpacity(opacity);
    }
  }, [opacity]);

  return null;
};

// MVT Vector Tile Layer Component (for Martin and similar vector tile servers)
const MVTLayer = ({ url, style, opacity = 0.7, visible = true, zIndex = 100, attribution = '' }) => {
  const map = useMap();
  const layerRef = useRef(null);

  // Create layer only when URL or style changes (not when visible/opacity changes)
  useEffect(() => {
    // Wait for vectorgrid to be loaded with max retries
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max (50 * 100ms)
    
    const checkAndCreateLayer = () => {
      // Check if vectorgrid is loaded
      if (!window.L || !window.L.vectorGrid || !window.L.vectorGrid.protobuf) {
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(checkAndCreateLayer, 100);
        } else {
          console.error('leaflet.vectorgrid failed to load after', maxRetries, 'retries');
        }
        return;
      }

      // Remove existing layer if any
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }

      try {
        // Parse style if provided
        let styleConfig = {};
        if (style) {
          try {
            styleConfig = typeof style === 'string' ? JSON.parse(style) : style;
          } catch (e) {
            console.warn('Invalid style JSON for MVT layer, using defaults:', e);
            styleConfig = {};
          }
        }

        // Default style for vector tiles - make it more visible
        const defaultStyle = {
          fill: true,
          fillColor: styleConfig.fillColor || styleConfig.fill || '#3388ff',
          fillOpacity: styleConfig.fillOpacity !== undefined ? styleConfig.fillOpacity : Math.max(opacity * 0.5, 0.3), // At least 30% visible
          stroke: true,
          color: styleConfig.color || styleConfig.stroke || '#3388ff',
          weight: styleConfig.weight || styleConfig.strokeWidth || 2,
          opacity: styleConfig.opacity !== undefined ? styleConfig.opacity : Math.max(opacity, 0.7), // At least 70% visible
        };

        // Create vector tile layer
        // Martin tiles use format: {url}/{z}/{x}/{y}.pbf
        // Other servers might use: {url}/{z}/{x}/{y}.mvt
        let tileUrl = url.trim();
        
        // Fix HTTP to HTTPS for spectra.brin.go.id (Martin returns http:// but should be https://)
        if (tileUrl.startsWith('http://spectra.brin.go.id')) {
          tileUrl = tileUrl.replace('http://', 'https://');
        }
        
        if (!tileUrl.includes('{z}')) {
          // Ensure URL ends with / if it doesn't have template
          tileUrl = tileUrl.endsWith('/') ? tileUrl : tileUrl + '/';
          tileUrl = `${tileUrl}{z}/{x}/{y}.pbf`;
        }

        console.log('Creating MVT layer with URL:', tileUrl, 'Style:', defaultStyle);

        const vectorLayer = L.vectorGrid.protobuf(tileUrl, {
          attribution: attribution || '',
          opacity: opacity,
          zIndex: zIndex,
          maxZoom: 19,
          minZoom: 0,
          // CORS handling
          crossOrigin: true,
          // Vector tile styling
          getFeatureId: function(f) {
            return f.properties.id || f.properties.osm_id || f.properties.gid;
          },
          // Style function - can be customized per feature
          vectorTileLayerStyles: {
            // Default style for all layers
            default: defaultStyle,
            // You can specify styles per layer name if needed
            // Example: 'roads': { color: '#ff0000', weight: 3 }
            ...(styleConfig.layers || {})
          },
          // Interactive options
          interactive: true,
          // Renderer options
          rendererFactory: L.svg.tile,
        });

        // Add error handling
        vectorLayer.on('error', function(e) {
          console.error('MVT layer error:', e);
        });

        // Add popup on click if needed
        if (styleConfig.popup !== false) {
          vectorLayer.on('click', function(e) {
            const props = e.layer.properties;
            if (props && Object.keys(props).length > 0) {
              let popupContent = '<div style="max-width: 200px;">';
              Object.keys(props).forEach(key => {
                if (key !== 'id' && key !== 'osm_id' && key !== 'gid') {
                  popupContent += `<strong>${key}:</strong> ${props[key]}<br>`;
                }
              });
              popupContent += '</div>';
              L.popup()
                .setLatLng(e.latlng)
                .setContent(popupContent)
                .openOn(map);
            }
          });
        }

        layerRef.current = vectorLayer;
        
        // Only add to map if visible
        if (visible) {
          vectorLayer.addTo(map);
          console.log('MVT layer added to map:', {
            url: tileUrl,
            visible: visible,
            opacity: opacity,
            zIndex: zIndex,
            style: defaultStyle
          });
        } else {
          console.log('MVT layer created but not added (visible=false):', tileUrl);
        }
      } catch (error) {
        console.error('Error creating MVT layer:', error);
      }
    };

    checkAndCreateLayer();

    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, url, style, zIndex, attribution]); // Removed visible and opacity from dependencies

  // Handle visibility changes separately
  useEffect(() => {
    if (!layerRef.current) return;

    if (visible) {
      if (!map.hasLayer(layerRef.current)) {
        layerRef.current.addTo(map);
      }
    } else {
      if (map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
      }
    }
  }, [map, visible]);

  // Handle opacity changes separately
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setOpacity(opacity);
    }
  }, [opacity]);

  return null;
};

// GeoJSON Layer Component
const GeoJSONLayer = ({ url, style, opacity = 0.7, visible = true, zIndex = 100 }) => {
  const map = useMap();
  const layerRef = useRef(null);
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    if (url && visible) {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          setGeoJsonData(data);
        })
        .catch(error => {
          console.error('Error loading GeoJSON:', error);
        });
    }
  }, [url, visible]);

  useEffect(() => {
    if (layerRef.current && map.hasLayer(layerRef.current)) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (geoJsonData && visible) {
      const layerStyle = style ? JSON.parse(style) : {
        color: '#3388ff',
        weight: 2,
        opacity: opacity
      };

      const geoJsonLayer = L.geoJSON(geoJsonData, {
        style: layerStyle,
        zIndex: zIndex
      });
      layerRef.current = geoJsonLayer;
      geoJsonLayer.addTo(map);
    }

    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, geoJsonData, visible, style, opacity, zIndex]);

  return null;
};

// BaseMap Layer Component
const BaseMapLayer = ({ basemap }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const baseMapConfig = BASEMAPS[basemap];
    if (baseMapConfig) {
      const tileLayer = L.tileLayer(baseMapConfig.url, {
        attribution: baseMapConfig.attribution,
        maxZoom: 19,
        zIndex: 0,
        ...(baseMapConfig.tileOptions || {})
      });
      const layers = [tileLayer];
      if (baseMapConfig.overlayUrl) {
        layers.push(L.tileLayer(baseMapConfig.overlayUrl, {
          maxZoom: 19,
          zIndex: 1,
          pane: 'overlayPane',
          ...(baseMapConfig.tileOptions || {})
        }));
      }
      const group = L.layerGroup(layers);
      group.addTo(map);
      layerRef.current = group;
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, basemap]);

  return null;
};

// BaseMap Selector Component
const BaseMapSelector = ({ selectedBasemap, onBasemapChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="basemap-selector">
      <div 
        className="basemap-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>🗺️ {t('maps.basemap')}</span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="basemap-options">
          {Object.keys(BASEMAPS).map((key) => (
            <div
              key={key}
              className={`basemap-option ${selectedBasemap === key ? 'active' : ''}`}
              onClick={() => {
                onBasemapChange(key);
                setIsExpanded(false);
              }}
            >
              {BASEMAPS[key].name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Map Info Panel (Title and Description) — original style
const MapInfoPanel = ({ mapName, mapDescription }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  if (!mapName && !mapDescription) return null;

  if (!isVisible) {
    return (
      <button
        type="button"
        className="map-info-toggle-hidden"
        onClick={() => setIsVisible(true)}
        title={t('maps.showInfo') || 'Show Map Info'}
      >
        ℹ️
      </button>
    );
  }

  return (
    <div className="map-info-panel">
      <div className="map-info-header">
        <div className="map-info-content">
          {mapName && <h2 className="map-info-title">{mapName}</h2>}
          {mapDescription && mapDescription.trim() && (
            <p className="map-info-description">{mapDescription}</p>
          )}
        </div>
        <button
          type="button"
          className="map-info-hide"
          onClick={() => setIsVisible(false)}
          title={t('common.close')}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Layer Item Component with expandable opacity and legend
const LayerItem = ({ layer, layerId, state, onToggleVisibility, onOpacityChange, onZoomToLayer }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOpacity, setShowOpacity] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  // When expand button is clicked, show/hide both opacity and legend
  const handleExpandToggle = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    setShowOpacity(newExpandedState);
    setShowLegend(newExpandedState);
  };

  return (
    <div className="layer-item">
      <div className="layer-item-header">
        <label className="layer-checkbox">
          <input
            type="checkbox"
            checked={state.visible}
            onChange={() => onToggleVisibility(layerId)}
          />
          <span>{layer.name}</span>
        </label>
        <div className="layer-header-actions">
          <button
            className="btn-zoom-to-layer"
            onClick={() => onZoomToLayer(layer)}
            title={t('maps.zoomToLayer')}
          >
            🔍
          </button>
          <button
            className="btn-expand-layer"
            onClick={handleExpandToggle}
            title={isExpanded ? t('common.collapse') : t('common.expand')}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <span className="layer-type-badge">{layer.type.toUpperCase()}</span>
        </div>
      </div>
      {state.visible && isExpanded && (
        <>
          <div className="layer-options">
            <div className="layer-option-section">
              <div className="layer-option-label">
                {t('maps.opacity')}: {Math.round(state.opacity * 100)}%
              </div>
              {showOpacity && (
                <div className="layer-controls">
                  <label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={state.opacity * 100}
                      onChange={(e) => onOpacityChange({ layerId, opacity: e.target.value / 100 })}
                    />
                  </label>
                </div>
              )}
            </div>
            {showLegend && (
              <div className="layer-option-section">
                <LayerLegend layer={layer} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Layer Legend Component
const LayerLegend = ({ layer }) => {
  const [legendUrl, setLegendUrl] = useState(null);
  const [hasError, setHasError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setHasError(false);
    const layerType = layer.type.toLowerCase();
    
    // For WMS layers, try to get legend via GetLegendGraphic
    if (layerType === 'wms' && layer.url && (layer.layer_name || layer.name)) {
      try {
        const wmsUrl = new URL(layer.url);
        const legendParams = new URLSearchParams({
          SERVICE: 'WMS',
          VERSION: '1.1.0',
          REQUEST: 'GetLegendGraphic',
          FORMAT: 'image/png',
          LAYER: layer.layer_name || layer.name,
          TRANSPARENT: 'true'
        });
        const legendUrlString = `${wmsUrl.origin}${wmsUrl.pathname}?${legendParams.toString()}`;
        setLegendUrl(legendUrlString);
      } catch (error) {
        console.error('Error constructing WMS legend URL:', error);
        setHasError(true);
      }
    }
    // For ArcGIS MapServer layers, try to get legend via REST API
    else if ((layerType === 'arcgis' || layerType === 'mapserver' || layerType === 'arcgismapserver') && layer.url) {
      try {
        let baseUrl = layer.url.trim();
        if (baseUrl.endsWith('/')) {
          baseUrl = baseUrl.slice(0, -1);
        }
        if (!baseUrl.endsWith('MapServer')) {
          baseUrl = baseUrl.endsWith('/') ? baseUrl + 'MapServer' : baseUrl + '/MapServer';
        }
        
        // ArcGIS MapServer legend endpoint: {baseUrl}/legend?f=json
        // For image: {baseUrl}/legend?f=png (if supported)
        // Or for specific layer: {baseUrl}/{layerId}/legend?f=png
        const layerId = layer.layer_id || layer.layerId;
        const legendEndpoint = layerId !== undefined && layerId !== null
          ? `${baseUrl}/${layerId}/legend?f=png`
          : `${baseUrl}/legend?f=png`;
        
        setLegendUrl(legendEndpoint);
      } catch (error) {
        console.error('Error constructing ArcGIS legend URL:', error);
        setHasError(true);
      }
    } else {
      setLegendUrl(null);
    }
  }, [layer]);

  // For WMS and ArcGIS MapServer, show legend image
  const layerType = layer.type.toLowerCase();
  if ((layerType === 'wms' || layerType === 'arcgis' || layerType === 'mapserver' || layerType === 'arcgismapserver') && legendUrl && !hasError) {
    return (
      <div className="layer-legend">
        <div className="legend-title">{t('maps.legend')}</div>
        <div className="legend-image-container">
          <img 
            src={legendUrl} 
            alt={`Legend for ${layer.name}`}
            className="legend-image"
            onError={() => setHasError(true)}
          />
        </div>
      </div>
    );
  }

  // For GeoJSON with style, show color swatch
  if (layer.type.toLowerCase() === 'geojson') {
    let styleObj = null;
    try {
      if (layer.style) {
        styleObj = typeof layer.style === 'string' ? JSON.parse(layer.style) : layer.style;
      }
    } catch (error) {
      // Invalid style, use default
    }

    // Default style if no style provided
    if (!styleObj) {
      styleObj = {
        color: '#3388ff',
        fillColor: '#3388ff',
        weight: 2,
        opacity: 0.7
      };
    }

    const color = styleObj.fillColor || styleObj.color || '#3388ff';
    const borderColor = styleObj.color || color;
    const weight = styleObj.weight || 2;

    return (
      <div className="layer-legend">
        <div className="legend-title">{t('maps.legend')}</div>
        <div className="legend-item">
          <div 
            className="legend-swatch" 
            style={{
              backgroundColor: styleObj.fillColor || color,
              border: `${weight}px solid ${borderColor}`,
              width: '20px',
              height: '20px'
            }}
          />
          <span className="legend-label">{layer.name}</span>
        </div>
      </div>
    );
  }

  // For other layer types (XYZ, etc), don't show legend
  return null;
};

// Layer Control Panel Component
const LayerControlPanel = ({ layerGroups, layerStates, onToggleVisibility, onOpacityChange, onShowAll, onHideAll, onZoomToLayer, isVisible, onTogglePanelVisibility }) => {
  const { t } = useTranslation();
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    const initial = {};
    layerGroups.forEach(group => {
      initial[group.id] = true;
    });
    setExpandedGroups(initial);
  }, [layerGroups]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="layer-control-panel">
      <div className="layer-control-header">
        <h3>{t('maps.layers')}</h3>
        <div className="layer-control-actions">
          <button onClick={onShowAll} className="btn-show-all">{t('maps.showAll')}</button>
          <button onClick={onHideAll} className="btn-hide-all">{t('maps.hideAll')}</button>
          <button onClick={onTogglePanelVisibility} className="btn-close-panel" title={t('common.close')}>✕</button>
        </div>
      </div>
      <div className="layer-groups-list">
        {layerGroups.map((group) => (
          <div key={group.id} className="layer-group">
            <div 
              className="layer-group-header"
              onClick={() => toggleGroup(group.id)}
            >
              <span className="group-name">{group.name}</span>
              <span>{expandedGroups[group.id] ? '▲' : '▼'}</span>
            </div>
            {expandedGroups[group.id] && group.layers && (
              <div className="layer-list">
                {group.layers.map((layer) => {
                  const layerId = `layer-${layer.id}`;
                  const state = layerStates[layerId] || { visible: layer.visible !== false, opacity: 0.7 };
                  return (
                    <LayerItem 
                      key={layer.id}
                      layer={layer}
                      layerId={layerId}
                      state={state}
                      onToggleVisibility={onToggleVisibility}
                      onOpacityChange={onOpacityChange}
                      onZoomToLayer={onZoomToLayer}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Component to access map instance for zooming and add custom zoom control
const MapZoomController = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (onMapReady && map) {
      onMapReady(map);
    }
    
    // Add zoom control to bottom right
    if (map && !map.zoomControlAdded) {
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);
      map.zoomControlAdded = true;
    }
  }, [map, onMapReady]);
  
  return null;
};

// Main Dynamic Map Component
const DynamicMap = ({ mapId }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { currentMap, layerStates, selectedBasemap, loading, error } = useSelector((state) => state.dynamicMap);
  const { items: stacItems } = useSelector((state) => state.stacCatalog);
  const mapInstanceRef = useRef(null);
  const chromeStackRef = useRef(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [stacPanelOpen, setStacPanelOpen] = useState(false);
  const [selectedStacItem, setSelectedStacItem] = useState(null);
  const [stacTilesLoading, setStacTilesLoading] = useState(false);
  const [hiddenExtentIds, setHiddenExtentIds] = useState(() => new Set());
  const [mapBbox, setMapBbox] = useState(null);

  const openStacPanel = () => {
    setStacPanelOpen(true);
    // On narrow screens only one side panel at a time
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsPanelVisible(false);
    }
  };

  const openLayersPanel = () => {
    setIsPanelVisible(true);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setStacPanelOpen(false);
    }
  };

  useEffect(() => {
    if (mapId) {
      dispatch(fetchMapByIdAsync(mapId));
    }
  }, [dispatch, mapId]);

  // Track chrome stack height so side panels sit below title + buttons
  useEffect(() => {
    const stack = chromeStackRef.current;
    const viewer = stack?.closest('.map-viewer');
    if (!stack || !viewer) return;

    const updateHeight = () => {
      viewer.style.setProperty('--chrome-stack-h', `${stack.offsetHeight}px`);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(stack);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [currentMap?.id, stacPanelOpen, isPanelVisible]);

  // Get center and zoom from map data
  const getMapCenter = () => {
    if (currentMap?.center?.coordinates) {
      return [currentMap.center.coordinates[1], currentMap.center.coordinates[0]];
    }
    if (currentMap?.center?.lat && currentMap?.center?.lng) {
      return [currentMap.center.lat, currentMap.center.lng];
    }
    return [-2.5, 118]; // Default: Indonesia center
  };

  const getMapZoom = () => {
    return currentMap?.zoom || 5;
  };

  const handleToggleVisibility = (layerId) => {
    dispatch(toggleLayerVisibility(layerId));
  };

  const handleOpacityChange = ({ layerId, opacity }) => {
    dispatch(setLayerOpacity({ layerId, opacity }));
  };

  const handleBasemapChange = (basemap) => {
    dispatch(setSelectedBasemap(basemap));
  };

  const handleShowAll = () => {
    dispatch(showAllLayers());
  };

  const handleHideAll = () => {
    dispatch(hideAllLayers());
  };

  const handleMapReady = (map) => {
    mapInstanceRef.current = map;
  };

  const handleStacItemSelect = useCallback((item) => {
    setSelectedStacItem(item);
  }, []);

  const handleToggleItemExtent = useCallback((itemId) => {
    setHiddenExtentIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const handleResetMapView = useCallback(() => {
    setSelectedStacItem(null);
    setHiddenExtentIds(new Set());
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(getMapCenter(), getMapZoom(), { animate: true });
  }, [currentMap]);

  const visibleStacItems = useMemo(
    () => stacItems.filter((item) => !hiddenExtentIds.has(item.id)),
    [stacItems, hiddenExtentIds]
  );

  useEffect(() => {
    setHiddenExtentIds((prev) => {
      const itemIds = new Set(stacItems.map((item) => item.id));
      const next = new Set([...prev].filter((id) => itemIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [stacItems]);

  const handleMapBboxChange = useCallback((bbox) => {
    setMapBbox(bbox);
  }, []);

  const selectedStacLabel =
    selectedStacItem?.properties?.title || selectedStacItem?.id || null;

  const handleZoomToLayer = (layer) => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Handle different layer types
    switch (layer.type.toLowerCase()) {
      case 'geojson':
        // For GeoJSON, try to fetch and get bounds
        if (layer.url) {
          fetch(layer.url)
            .then(response => response.json())
            .then(data => {
              if (data.features && data.features.length > 0) {
                const geoJsonLayer = L.geoJSON(data);
                const bounds = geoJsonLayer.getBounds();
                if (bounds.isValid()) {
                  map.fitBounds(bounds, { padding: [50, 50] });
                }
              }
            })
            .catch(error => {
              console.error('Error fetching GeoJSON for zoom:', error);
              // Fallback: zoom to map center with higher zoom
              if (currentMap?.zoom) {
                map.setZoom(Math.min(currentMap.zoom + 3, 18));
              }
            });
        }
        break;

      case 'wms':
        // For WMS, try to get bounds from GetCapabilities if possible
        // For now, use a fallback approach - zoom to a reasonable level
        if (currentMap?.center) {
          const center = getMapCenter();
          map.setView(center, Math.min((currentMap.zoom || 5) + 2, 15));
        }
        break;

      case 'xyz':
        // For XYZ tiles, we don't have bounds info
        // Use fallback: zoom to center with higher zoom
        if (currentMap?.center) {
          const center = getMapCenter();
          map.setView(center, Math.min((currentMap.zoom || 5) + 2, 15));
        }
        break;

      case 'arcgis':
      case 'mapserver':
      case 'arcgismapserver':
        // For ArcGIS MapServer, try to get extent from service if possible
        // For now, use fallback: zoom to center with higher zoom
        if (currentMap?.center) {
          const center = getMapCenter();
          map.setView(center, Math.min((currentMap.zoom || 5) + 2, 15));
        }
        break;

      default:
        // Fallback: zoom to map center with higher zoom
        if (currentMap?.center) {
          const center = getMapCenter();
          map.setView(center, Math.min((currentMap.zoom || 5) + 2, 15));
        }
    }
  };

  if (loading) {
    return (
      <div className="map-loading-skeleton">
        <Skeleton variant="circle" width={60} height={60} />
        <Skeleton variant="text" width={200} height={20} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-error">
        <p>{t('maps.error')}: {error}</p>
      </div>
    );
  }

  if (!currentMap) {
    return (
      <div className="map-no-data">
        <p>{t('maps.noData')}</p>
      </div>
    );
  }

  const center = getMapCenter();
  const zoom = getMapZoom();

  const viewerClasses = [
    'map-viewer',
    stacPanelOpen ? 'stac-open' : '',
    isPanelVisible && currentMap.layer_groups?.length ? 'layers-open' : '',
    selectedStacItem ? 'stac-viewing' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="dynamic-map-container">
      <div className={viewerClasses}>
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <MapZoomController onMapReady={handleMapReady} />
          <MapExtentTracker onBboxChange={handleMapBboxChange} />
          <BaseMapLayer basemap={selectedBasemap} />
          
          {currentMap.layer_groups?.map((group) =>
            group.layers?.map((layer) => {
              const layerId = `layer-${layer.id}`;
              const state = layerStates[layerId] || { visible: layer.visible !== false, opacity: 0.7 };
              
              if (!state.visible) return null;

              switch (layer.type.toLowerCase()) {
                case 'wms':
                  return (
                    <WMSTileLayer
                      key={layer.id}
                      url={layer.url}
                      layerName={layer.layer_name || layer.name}
                      opacity={state.opacity}
                      visible={state.visible}
                      zIndex={layer.z_index || 100}
                    />
                  );
                case 'xyz':
                  return (
                    <XYZTileLayer
                      key={layer.id}
                      url={layer.url}
                      opacity={state.opacity}
                      visible={state.visible}
                      zIndex={layer.z_index || 100}
                      attribution={layer.style || ''}
                    />
                  );
                case 'arcgis':
                case 'mapserver':
                case 'arcgismapserver':
                  return (
                    <ArcGISMapServerLayer
                      key={layer.id}
                      url={layer.url}
                      layerId={layer.layer_id || layer.layerId || null}
                      opacity={state.opacity}
                      visible={state.visible}
                      zIndex={layer.z_index || 100}
                      attribution={layer.attribution || layer.style || '&copy; Esri'}
                    />
                  );
                case 'geojson':
                  return (
                    <GeoJSONLayer
                      key={layer.id}
                      url={layer.url}
                      style={layer.style}
                      opacity={state.opacity}
                      visible={state.visible}
                      zIndex={layer.z_index || 100}
                    />
                  );
                case 'mvt':
                  return (
                    <MVTLayer
                      key={layer.id}
                      url={layer.url}
                      style={layer.style}
                      opacity={state.opacity}
                      visible={state.visible}
                      zIndex={layer.z_index || 100}
                      attribution={layer.attribution || ''}
                    />
                  );
                case 'wfs':
                  // WFS requires more complex handling
                  console.warn(`Layer type ${layer.type} not yet fully implemented`);
                  return null;
                default:
                  return null;
              }
            })
          )}

          {stacPanelOpen && visibleStacItems.length > 0 && (
            <StacExtentsLayer
              items={visibleStacItems}
              onItemClick={handleStacItemSelect}
              selectedItemId={selectedStacItem?.id}
              visible
            />
          )}
          {selectedStacItem && (
            <StacImageryLayer
              item={selectedStacItem}
              selected
              onLoadingChange={setStacTilesLoading}
            />
          )}
        </MapContainer>

        {/* Top chrome: info panel first, Katalog Citra below */}
        <div className="map-chrome-stack" ref={chromeStackRef}>
          {!stacPanelOpen && (
            <MapInfoPanel
              mapName={currentMap.name}
              mapDescription={currentMap.description}
            />
          )}

          <div className="map-chrome-toolbar">
            <button
              type="button"
              className={`map-chrome-btn stac-toggle-button ${stacPanelOpen ? 'active' : ''}`}
              onClick={() => (stacPanelOpen ? setStacPanelOpen(false) : openStacPanel())}
              title={t('stacCatalog.panelTitle')}
            >
              {t('stacCatalog.panelTitle')}
              {stacItems.length > 0 ? ` (${stacItems.length})` : ''}
            </button>

            {currentMap.layer_groups && currentMap.layer_groups.length > 0 && !isPanelVisible && (
              <button
                type="button"
                className="map-chrome-btn panel-toggle-button"
                onClick={openLayersPanel}
                title={t('maps.layers')}
              >
                ☰ {t('maps.layers')}
              </button>
            )}
          </div>
        </div>

        <BaseMapSelector
          selectedBasemap={selectedBasemap}
          onBasemapChange={handleBasemapChange}
        />

        {stacTilesLoading && (
          <div className="stac-map-loading-inline">
            <div className="stac-spinner" />
            <span>{t('stacCatalog.loadingTiles')}</span>
          </div>
        )}

        <StacCatalogPanel
          isOpen={stacPanelOpen}
          onClose={() => setStacPanelOpen(false)}
          selectedItem={selectedStacItem}
          selectedLabel={selectedStacLabel}
          onItemSelect={handleStacItemSelect}
          onClearSelection={() => setSelectedStacItem(null)}
          hiddenExtentIds={hiddenExtentIds}
          onToggleItemExtent={handleToggleItemExtent}
          onResetView={handleResetMapView}
          mapBbox={mapBbox}
        />

        {currentMap.layer_groups && currentMap.layer_groups.length > 0 && (
          <LayerControlPanel
            layerGroups={currentMap.layer_groups}
            layerStates={layerStates}
            onToggleVisibility={handleToggleVisibility}
            onOpacityChange={handleOpacityChange}
            onShowAll={handleShowAll}
            onHideAll={handleHideAll}
            onZoomToLayer={handleZoomToLayer}
            isVisible={isPanelVisible}
            onTogglePanelVisibility={() => setIsPanelVisible(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DynamicMap;

