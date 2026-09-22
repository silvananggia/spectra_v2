import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control/defaults';
import { defaults as defaultInteractions } from 'ol/interaction/defaults';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import { createCartoGreyLayers } from '../utils/basemap';
import 'ol/ol.css';

const withAlpha = (hex, alpha) => {
    const raw = hex.replace('#', '');
    const value = Number.parseInt(raw, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const markerStyle = (color) => [
    new Style({
        image: new CircleStyle({
            radius: 16,
            fill: new Fill({ color: withAlpha(color, 0.28) }),
        }),
    }),
    new Style({
        image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: '#ffffff', width: 2 }),
        }),
    }),
];

const EventSnapshotMap = ({ center, zoom = 10, color = '#c31d12', className = '' }) => {
    const hostRef = useRef(null);
    const mapRef = useRef(null);
    const viewRef = useRef(null);
    const featureRef = useRef(null);

    useEffect(() => {
        if (!hostRef.current || !center?.length) return undefined;

        const feature = new Feature({
            geometry: new Point(fromLonLat(center)),
        });
        feature.setStyle(markerStyle(color));
        featureRef.current = feature;

        const view = new View({
            center: fromLonLat(center),
            zoom,
            minZoom: 7,
            maxZoom: 14,
        });
        viewRef.current = view;

        const map = new Map({
            target: hostRef.current,
            layers: [
                ...createCartoGreyLayers(),
                new VectorLayer({
                    source: new VectorSource({ features: [feature] }),
                }),
            ],
            view,
            controls: defaultControls({ zoom: false, rotate: false, attribution: false }),
            interactions: defaultInteractions({
                dragPan: false,
                mouseWheelZoom: false,
                doubleClickZoom: false,
                altShiftDragRotate: false,
                pinchRotate: false,
                pinchZoom: false,
                keyboard: false,
            }),
        });
        mapRef.current = map;

        const resize = () => map.updateSize();
        const frame = window.requestAnimationFrame(resize);
        const timer = window.setTimeout(resize, 80);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timer);
            map.setTarget(undefined);
            map.dispose();
            mapRef.current = null;
            viewRef.current = null;
            featureRef.current = null;
        };
    }, [center, zoom, color]);

    return (
        <div
            ref={hostRef}
            className={`event-snapshot-map ${className}`.trim()}
            aria-hidden="true"
        />
    );
};

export default EventSnapshotMap;
