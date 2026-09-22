import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

export const CARTO_GREY_ATTRIBUTION =
    'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ';

export const CARTO_GREY_URL_OL =
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

export const CARTO_GREY_LABELS_URL_OL =
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}';

export const CARTO_GREY_URL_LEAFLET = CARTO_GREY_URL_OL;
export const CARTO_GREY_LABELS_URL_LEAFLET = CARTO_GREY_LABELS_URL_OL;

const greyXyz = (url, withAttribution = false) =>
    new XYZ({
        url,
        attributions: withAttribution ? CARTO_GREY_ATTRIBUTION : '',
        maxZoom: 16,
        crossOrigin: 'anonymous',
    });

export const createCartoGreySource = () => greyXyz(CARTO_GREY_URL_OL, true);

export const createCartoGreyLayers = () => [
    new TileLayer({ source: greyXyz(CARTO_GREY_URL_OL, true) }),
    new TileLayer({ source: greyXyz(CARTO_GREY_LABELS_URL_OL) }),
];
