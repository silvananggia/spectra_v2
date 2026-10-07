import React from 'react';
import DynamicMap from './DynamicMap';
import '../assets/style/ColorPalette.css';
import './MapProducts.scss';

const DEFAULT_MAP_ID = '05b66a73-b879-4349-b28a-9642376f9f39';

const MapProducts = () => (
  <main className="map-products-page">
    <div className="map-viewer-container-full">
      <DynamicMap mapId={DEFAULT_MAP_ID} />
    </div>
  </main>
);

export default MapProducts;
