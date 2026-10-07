import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { fromExtent } from 'ol/geom/Polygon';
import Draw, { createBox } from 'ol/interaction/Draw';
import DragPan from 'ol/interaction/DragPan';
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';
import { defaults as defaultInteractions } from 'ol/interaction/defaults';
import { defaults as defaultControls } from 'ol/control/defaults';
import { fromLonLat, transformExtent } from 'ol/proj';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { INDONESIA_CENTER } from '../utils/activationSession';
import { createCartoGreyLayers } from '../utils/basemap';
import 'ol/ol.css';
import './OpenLayersMap.scss';

const AOI_STYLE = new Style({
    fill: new Fill({ color: 'rgba(220, 38, 38, 0.28)' }),
    stroke: new Stroke({ color: 'rgba(220, 38, 38, 0.9)', width: 2 }),
});

const DRAW_STYLE = new Style({
    fill: new Fill({ color: 'rgba(220, 38, 38, 0.18)' }),
    stroke: new Stroke({ color: 'rgba(220, 38, 38, 0.9)', width: 2, lineDash: [6, 4] }),
});

const toMapExtent = (extent4326) => transformExtent(extent4326, 'EPSG:4326', 'EPSG:3857');
const toLonLatExtent = (extent3857) => transformExtent(extent3857, 'EPSG:3857', 'EPSG:4326');

const applyAoi = (source, aoiExtent, showAoi) => {
    if (!source) return;
    source.clear();
    if (showAoi && aoiExtent?.length === 4) {
        source.addFeature(new Feature(fromExtent(toMapExtent(aoiExtent))));
    }
};

const applyFit = (map, fitExtent, duration = 0) => {
    if (!map || !fitExtent?.length) return;
    map.updateSize();
    const size = map.getSize();
    if (!size || !size[0] || !size[1]) return false;
    map.getView().fit(toMapExtent(fitExtent), {
        size,
        padding: [48, 48, 48, 48],
        duration,
        maxZoom: 14,
        nearest: true,
    });
    return true;
};

const OpenLayersMap = forwardRef(function OpenLayersMap(
    {
        className = '',
        interactive = true,
        tool = 'pan',
        aoiExtent,
        onAoiChange,
        fitExtent,
        showAoi = true,
    },
    ref
) {
    const hostRef = useRef(null);
    const mapRef = useRef(null);
    const sourceRef = useRef(null);
    const drawRef = useRef(null);
    const onAoiChangeRef = useRef(onAoiChange);
    const fitExtentRef = useRef(fitExtent);
    const aoiExtentRef = useRef(aoiExtent);
    const showAoiRef = useRef(showAoi);
    onAoiChangeRef.current = onAoiChange;
    fitExtentRef.current = fitExtent;
    aoiExtentRef.current = aoiExtent;
    showAoiRef.current = showAoi;

    useImperativeHandle(ref, () => ({
        zoomBy(delta) {
            const view = mapRef.current?.getView();
            if (!view) return;
            const zoom = view.getZoom() || 5;
            view.animate({ zoom: zoom + delta, duration: 180 });
        },
        updateSize() {
            mapRef.current?.updateSize();
        },
    }));

    useEffect(() => {
        if (!hostRef.current) return undefined;

        const vectorSource = new VectorSource();
        sourceRef.current = vectorSource;

        const map = new Map({
            target: hostRef.current,
            layers: [
                ...createCartoGreyLayers(),
                new VectorLayer({
                    source: vectorSource,
                    style: AOI_STYLE,
                }),
            ],
            view: new View({
                center: fromLonLat(INDONESIA_CENTER),
                zoom: 5,
                minZoom: 4,
                maxZoom: 18,
            }),
            controls: defaultControls({
                zoom: false,
                rotate: false,
                attributionOptions: { collapsible: true },
            }),
            interactions: defaultInteractions({
                dragPan: interactive,
                mouseWheelZoom: interactive,
                doubleClickZoom: interactive,
                altShiftDragRotate: false,
                pinchRotate: false,
            }),
        });
        mapRef.current = map;

        const draw = new Draw({
            source: vectorSource,
            type: 'Circle',
            geometryFunction: createBox(),
            style: DRAW_STYLE,
        });
        draw.setActive(false);
        draw.on('drawstart', () => {
            vectorSource.clear();
        });
        draw.on('drawend', (event) => {
            const extent = toLonLatExtent(event.feature.getGeometry().getExtent());
            onAoiChangeRef.current?.(extent);
        });
        map.addInteraction(draw);
        drawRef.current = draw;

        const syncView = (duration) => {
            applyAoi(vectorSource, aoiExtentRef.current, showAoiRef.current);
            applyFit(map, fitExtentRef.current, duration);
        };

        syncView(0);
        const frame = window.requestAnimationFrame(() => syncView(0));
        const timer = window.setTimeout(() => syncView(0), 120);
        const resize = () => map.updateSize();
        window.addEventListener('resize', resize);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timer);
            window.removeEventListener('resize', resize);
            map.setTarget(undefined);
            map.dispose();
            mapRef.current = null;
            sourceRef.current = null;
            drawRef.current = null;
        };
    }, [interactive]);

    useEffect(() => {
        const map = mapRef.current;
        const draw = drawRef.current;
        if (!map || !draw) return;
        const drawing = interactive && tool === 'draw';
        draw.setActive(drawing);
        map.getInteractions().forEach((interaction) => {
            if (interaction instanceof DragPan) interaction.setActive(interactive && !drawing);
            if (interaction instanceof DoubleClickZoom) interaction.setActive(interactive && !drawing);
        });
        map.getViewport().style.cursor = drawing ? 'crosshair' : interactive ? 'grab' : 'default';
    }, [tool, interactive]);

    useEffect(() => {
        applyAoi(sourceRef.current, aoiExtent, showAoi);
    }, [aoiExtent, showAoi]);

    const fitKey = Array.isArray(fitExtent) ? fitExtent.join(',') : '';

    useEffect(() => {
        applyFit(mapRef.current, fitExtent, 400);
    }, [fitKey, fitExtent]);

    return <div ref={hostRef} className={`ol-map ${className}`.trim()} />;
});

export default OpenLayersMap;
