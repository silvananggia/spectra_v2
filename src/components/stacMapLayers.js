import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { boundsToBbox } from '../services/stac.service';
import { useTranslation } from '../utils/i18n';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const upgradeHttps = (url) => {
  if (!url) return url;
  if (url.startsWith('http://') && window.location.protocol === 'https:') {
    return url.replace('http://', 'https://');
  }
  return url;
};

const getItemThumbnail = (item) =>
  upgradeHttps(item.assets?.thumbnail?.href || item.assets?.visual?.href || '');

export const MapExtentTracker = ({ onBboxChange }) => {
  const map = useMap();
  const onBboxChangeRef = useRef(onBboxChange);
  onBboxChangeRef.current = onBboxChange;

  useEffect(() => {
    const emit = () => {
      onBboxChangeRef.current(boundsToBbox(map.getBounds()));
    };

    emit();
    map.on('moveend', emit);

    return () => {
      map.off('moveend', emit);
    };
  }, [map]);

  return null;
};

export const StacExtentsLayer = ({ items, onItemClick, selectedItemId, visible }) => {
  const map = useMap();
  const { t } = useTranslation();
  const layersRef = useRef([]);
  const onItemClickRef = useRef(onItemClick);
  onItemClickRef.current = onItemClick;

  useEffect(() => {
    layersRef.current.forEach((layer) => {
      if (layer && map.hasLayer(layer)) map.removeLayer(layer);
    });
    layersRef.current = [];

    if (!items?.length || !visible) return;

    items.forEach((item) => {
      if (!item.geometry) return;
      const isSelected = selectedItemId === item.id;
      const geoJsonLayer = L.geoJSON(item.geometry, {
        style: {
          color: isSelected ? '#0099FF' : '#003366',
          weight: isSelected ? 3 : 1.5,
          dashArray: isSelected ? null : '4, 4',
          fillColor: isSelected ? '#0099FF' : '#003366',
          fillOpacity: isSelected ? 0.12 : 0.04,
          opacity: isSelected ? 1 : 0.7,
        },
      });

      const title = item.properties?.title || item.id;
      const date = item.properties?.datetime || item.properties?.created;
      const dateLabel = date
        ? new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : t('stacCatalog.noDate');
      const thumbnail = getItemThumbnail(item);
      const thumbHtml = thumbnail
        ? `<img class="stac-popup-thumb" src="${escapeHtml(thumbnail)}" alt="" loading="lazy" />`
        : `<div class="stac-popup-thumb placeholder">${escapeHtml(t('stacCatalog.noPreview'))}</div>`;

      const popupDiv = L.DomUtil.create('div', 'stac-item-popup');
      popupDiv.innerHTML = `
        ${thumbHtml}
        <div class="stac-popup-body">
          <h3 title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
          <p><strong>${escapeHtml(t('stacCatalog.popupCollection'))}:</strong> ${escapeHtml(item.collection || '—')}</p>
          <p><strong>${escapeHtml(t('stacCatalog.popupDate'))}:</strong> ${escapeHtml(dateLabel)}</p>
          <button type="button" class="stac-popup-show-btn">
            ${escapeHtml(t('stacCatalog.showOnMap'))}
          </button>
        </div>
      `;

      const showBtn = popupDiv.querySelector('.stac-popup-show-btn');
      L.DomEvent.on(showBtn, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        onItemClickRef.current?.(item);
        geoJsonLayer.closePopup();
      });

      geoJsonLayer.bindPopup(popupDiv, {
        maxWidth: 280,
        className: 'stac-leaflet-popup',
        autoPan: true,
      });

      geoJsonLayer.on('mouseover', (e) => {
        if (selectedItemId !== item.id) {
          e.target.setStyle({ weight: 2.5, fillOpacity: 0.1, opacity: 1 });
        }
      });

      geoJsonLayer.on('mouseout', (e) => {
        if (selectedItemId !== item.id) {
          e.target.setStyle({
            weight: 1.5,
            fillOpacity: 0.04,
            opacity: 0.7,
            dashArray: '4, 4',
          });
        }
      });

      geoJsonLayer.addTo(map);
      layersRef.current.push(geoJsonLayer);
    });

    return () => {
      layersRef.current.forEach((layer) => {
        if (layer && map.hasLayer(layer)) map.removeLayer(layer);
      });
      layersRef.current = [];
    };
  }, [map, items, selectedItemId, visible, t]);

  return null;
};

export const StacImageryLayer = ({ item, selected, onLoadingChange }) => {
  const map = useMap();
  const tileLayerRef = useRef(null);

  useEffect(() => {
    if (tileLayerRef.current && map.hasLayer(tileLayerRef.current)) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    if (!item || !selected) {
      if (onLoadingChange) onLoadingChange(false);
      return;
    }

    const tilesAsset = Object.values(item.assets || {}).find((asset) => {
      const roles = asset.roles || [];
      return roles.includes('tiles') || roles.includes('data');
    });

    if (!tilesAsset?.href) {
      if (onLoadingChange) onLoadingChange(false);
      return;
    }

    let tileUrl = tilesAsset.href;
    if (tileUrl.startsWith('http://') && window.location.protocol === 'https:') {
      tileUrl = tileUrl.replace('http://', 'https://');
    }
    if (!tileUrl.includes('{z}')) {
      tileUrl = tileUrl.endsWith('/') ? tileUrl : `${tileUrl}/`;
      tileUrl = `${tileUrl}{z}/{x}/{y}.png`;
    }

    const isTMS =
      tileUrl.includes('spectra.brin.go.id/tiles') ||
      (tileUrl.includes('/tiles/') && !tileUrl.includes('tms=false'));

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: item.id || '',
      opacity: 1,
      zIndex: 1000,
      maxZoom: tilesAsset['tiles:max_zoom'] || 18,
      minZoom: tilesAsset['tiles:min_zoom'] || 0,
      crossOrigin: 'anonymous',
      tms: isTMS,
    });

    let loading = 0;
    let loaded = 0;
    const updateLoading = () => {
      if (onLoadingChange) onLoadingChange(loading > loaded);
    };

    tileLayer.on('loading', () => {
      loading += 1;
      updateLoading();
    });
    tileLayer.on('load', () => {
      loaded += 1;
      updateLoading();
    });
    tileLayer.on('tileerror', (error, tile) => {
      if (tile?.el) tile.el.style.display = 'none';
      loaded += 1;
      updateLoading();
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;
    if (onLoadingChange) onLoadingChange(true);

    if (item.bbox?.length === 4) {
      const [minx, miny, maxx, maxy] = item.bbox;
      map.fitBounds(
        [
          [miny, minx],
          [maxy, maxx],
        ],
        { padding: [48, 48] }
      );
    } else if (item.geometry) {
      const temp = L.geoJSON(item.geometry);
      const bounds = temp.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [48, 48] });
    }

    return () => {
      if (tileLayerRef.current && map.hasLayer(tileLayerRef.current)) {
        map.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }
      if (onLoadingChange) onLoadingChange(false);
    };
  }, [map, item, selected, onLoadingChange]);

  return null;
};
