import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { fromLonLat, transformExtent } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control/defaults';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import { logout } from '../redux/slices/auth';
import { useTranslation } from '../utils/i18n';
import logoMark from '../assets/images/monitoring/logo.png';
import iconList from '../assets/images/monitoring/icon-list.svg';
import iconFireTitle from '../assets/images/monitoring/icon-fire-title.svg';
import iconClose from '../assets/images/monitoring/icon-close.svg';
import iconSearch from '../assets/images/monitoring/icon-search.svg';
import iconPin from '../assets/images/monitoring/icon-pin.svg';
import iconLive from '../assets/images/monitoring/icon-live.svg';
import iconLiveStale from '../assets/images/monitoring/icon-live-stale.svg';
import iconDownload from '../assets/images/monitoring/icon-download.svg';
import iconFireFill from '../assets/images/monitoring/icon-fire-fill.svg';
import iconOpacity from '../assets/images/monitoring/icon-opacity.svg';
import iconScene from '../assets/images/monitoring/icon-scene.svg';
import iconWind from '../assets/images/monitoring/icon-wind.svg';
import iconRain from '../assets/images/monitoring/icon-rain.svg';
import iconLand from '../assets/images/monitoring/icon-land.svg';
import iconHome from '../assets/images/monitoring/icon-home.svg';
import iconSearchNav from '../assets/images/monitoring/icon-search-nav.svg';
import iconFireNav from '../assets/images/monitoring/icon-fire-nav.svg';
import iconHistory from '../assets/images/monitoring/icon-drought.svg';
import iconLogout from '../assets/images/monitoring/icon-logout.svg';
import iconLayers from '../assets/images/monitoring/icon-layers.svg';
import iconPlus from '../assets/images/monitoring/icon-plus.svg';
import iconMinus from '../assets/images/monitoring/icon-minus.svg';
import iconDot from '../assets/images/monitoring/icon-dot.svg';
import iconMinimize from '../assets/images/monitoring/icon-minimize.svg';
import iconLegend from '../assets/images/monitoring/icon-legend.svg';
import iconCircle from '../assets/images/monitoring/icon-circle.svg';
import iconCircleHigh from '../assets/images/monitoring/icon-circle-high.svg';
import iconCircleMid from '../assets/images/monitoring/icon-circle-mid.svg';
import iconCircleLow from '../assets/images/monitoring/icon-circle-low.svg';
import iconPolygon from '../assets/images/monitoring/icon-polygon.svg';
import 'ol/ol.css';
import './Monitoring.scss';

const IMAGERY_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const LABEL_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

const CONFIDENCE_COLOR = {
    high: '#C31D12',
    mid: '#FDB52A',
    low: '#2A8D5D',
};

const HIDDEN_STYLE = new Style({});

const hotspotStyle = (level) => new Style({
    image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: CONFIDENCE_COLOR[level] }),
        stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 1 }),
    }),
});

const HOTSPOT_STYLES = {
    high: hotspotStyle('high'),
    mid: hotspotStyle('mid'),
    low: hotspotStyle('low'),
};

const BURNED_STYLE = new Style({
    fill: new Fill({ color: 'rgba(196, 92, 62, 0.55)' }),
    stroke: new Stroke({ color: '#f0c2b0', width: 1.25 }),
});

const mulberry32 = (seed) => {
    let state = seed;
    return () => {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let next = Math.imul(state ^ (state >>> 15), 1 | state);
        next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
        return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
};

const buildHotspots = () => {
    const rand = mulberry32(20260810);
    const clusters = [
        { n: 680, lon: [111.8, 115.8], lat: [-3.4, -0.2] },
        { n: 320, lon: [115.2, 118.6], lat: [-1.5, 2.4] },
        { n: 235, lon: [109.0, 112.4], lat: [-1.2, 2.2] },
    ];
    const points = [];
    let index = 1;

    clusters.forEach((cluster) => {
        for (let i = 0; i < cluster.n; i += 1) {
            const roll = rand();
            const confidence = roll < 0.08 ? 'high' : roll < 0.3 ? 'low' : 'mid';
            points.push({
                id: `HS-${String(index).padStart(4, '0')}`,
                lon: cluster.lon[0] + rand() * (cluster.lon[1] - cluster.lon[0]),
                lat: cluster.lat[0] + rand() * (cluster.lat[1] - cluster.lat[0]),
                confidence,
            });
            index += 1;
        }
    });

    return points;
};

const HOTSPOTS = buildHotspots();

const BURNED_AREAS = [
    {
        id: 'BA-0142',
        region: 'Pulang Pisau',
        areaHa: 842,
        ring: [[113.55, -2.35], [114.25, -2.28], [114.32, -2.72], [113.48, -2.8], [113.55, -2.35]],
    },
    {
        id: 'BA-0208',
        region: 'Kapuas',
        areaHa: 516,
        ring: [[114.15, -2.85], [114.7, -2.9], [114.62, -3.25], [114.08, -3.18], [114.15, -2.85]],
    },
    {
        id: 'BA-0311',
        region: 'Kotawaringin Timur',
        areaHa: 390,
        ring: [[112.55, -2.15], [113.15, -2.05], [113.05, -2.48], [112.48, -2.42], [112.55, -2.15]],
    },
    {
        id: 'BA-0440',
        region: 'Kutai Kartanegara',
        areaHa: 274,
        ring: [[116.4, -0.15], [117.05, -0.05], [117.1, -0.48], [116.35, -0.55], [116.4, -0.15]],
    },
];

const REGIONS = [
    { name: 'Kalimantan Tengah', keys: ['kalimantan tengah', 'kalteng'], center: [113.9, -1.7], zoom: 7 },
    { name: 'Kalimantan Barat', keys: ['kalimantan barat', 'kalbar'], center: [111.1, 0.1], zoom: 7 },
    { name: 'Kalimantan Timur', keys: ['kalimantan timur', 'kaltim'], center: [116.6, 0.6], zoom: 7 },
    { name: 'Kalimantan Selatan', keys: ['kalimantan selatan', 'kalsel'], center: [115.4, -2.9], zoom: 8 },
    { name: 'Riau', keys: ['riau'], center: [101.45, 0.5], zoom: 7 },
    { name: 'Kota Palangka Raya', keys: ['palangka raya', 'palangkaraya'], center: [113.92, -2.21], zoom: 11 },
    { name: 'Kabupaten Pulang Pisau', keys: ['pulang pisau'], center: [114.05, -2.68], zoom: 10 },
    { name: 'Kabupaten Kapuas', keys: ['kapuas'], center: [114.38, -2.95], zoom: 10 },
    { name: 'Kabupaten Kotawaringin Timur', keys: ['kotawaringin timur', 'kotim'], center: [112.75, -2.2], zoom: 9 },
    { name: 'Kecamatan Sebangau', keys: ['sebangau'], center: [113.72, -2.45], zoom: 11 },
    { name: 'Kecamatan Kahayan Hilir', keys: ['kahayan hilir'], center: [114.18, -2.85], zoom: 11 },
    { name: 'Kecamatan Mentaya Hilir', keys: ['mentaya hilir'], center: [112.95, -2.7], zoom: 11 },
    { name: 'Kota Pontianak', keys: ['pontianak'], center: [109.34, -0.03], zoom: 11 },
    { name: 'Kota Samarinda', keys: ['samarinda'], center: [117.14, -0.5], zoom: 11 },
    { name: 'Kabupaten Kutai Kartanegara', keys: ['kutai kartanegara', 'kukar'], center: [116.6, -0.2], zoom: 9 },
    { name: 'Kota Pekanbaru', keys: ['pekanbaru'], center: [101.45, 0.51], zoom: 11 },
    { name: 'Kabupaten Pelalawan', keys: ['pelalawan'], center: [102.2, 0.3], zoom: 9 },
    { name: 'Kabupaten Siak', keys: ['siak'], center: [101.8, 0.85], zoom: 9 },
];

const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const downloadCsv = (filename, rows) => {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

const Switch = ({ checked, onChange, label }) => (
    <button
        type="button"
        className={`mon-switch${checked ? ' is-on' : ''}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
    >
        <span />
    </button>
);

const Chevron = () => (
    <svg className="mon-chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path d="M3.5 6.2 8 10.4l4.5-4.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const Monitoring = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const hostRef = useRef(null);
    const searchRef = useRef(null);
    const mapRef = useRef(null);
    const hotspotSourceRef = useRef(null);
    const burnedLayerRef = useRef(null);
    const labelsRef = useRef(null);

    const [panelOpen, setPanelOpen] = useState(true);
    const [query, setQuery] = useState('');
    const [searchState, setSearchState] = useState(null);
    const [hotspotOn, setHotspotOn] = useState(true);
    const [burnedOn, setBurnedOn] = useState(false);
    const [opacity, setOpacity] = useState(82);
    const [windOn, setWindOn] = useState(false);
    const [rainOn, setRainOn] = useState(false);
    const [landOn, setLandOn] = useState(false);
    const [hotspotFilterOpen, setHotspotFilterOpen] = useState(false);
    const [burnedFilterOpen, setBurnedFilterOpen] = useState(false);
    const [confidence, setConfidence] = useState({ high: true, mid: true, low: true });
    const [attributesOpen, setAttributesOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(true);
    const [legendOpen, setLegendOpen] = useState(true);
    const [labelsOn, setLabelsOn] = useState(false);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const hotspotSource = new VectorSource({
            features: HOTSPOTS.map((point) => new Feature({
                geometry: new Point(fromLonLat([point.lon, point.lat])),
                id: point.id,
                lon: point.lon.toFixed(5),
                lat: point.lat.toFixed(5),
                confidence: point.confidence,
            })),
        });
        hotspotSource.getFeatures().forEach((feature) => {
            feature.setStyle(HOTSPOT_STYLES[feature.get('confidence')]);
        });

        const burnedSource = new VectorSource({
            features: BURNED_AREAS.map((area) => new Feature({
                geometry: new Polygon([area.ring.map((coord) => fromLonLat(coord))]),
                id: area.id,
                region: area.region,
                areaHa: area.areaHa,
            })),
        });

        const burnedLayer = new VectorLayer({
            source: burnedSource,
            style: BURNED_STYLE,
            visible: false,
            opacity: 0.82,
        });
        const labels = new TileLayer({
            source: new XYZ({ url: LABEL_URL, maxZoom: 19, crossOrigin: 'anonymous' }),
            visible: false,
        });
        const imagery = new TileLayer({
            source: new XYZ({
                url: IMAGERY_URL,
                attributions: 'Tiles &copy; Esri',
                maxZoom: 19,
                crossOrigin: 'anonymous',
            }),
        });
        const hotspotLayer = new VectorLayer({ source: hotspotSource, zIndex: 2 });

        const map = new Map({
            target: host,
            layers: [imagery, labels, burnedLayer, hotspotLayer],
            view: new View({
                center: fromLonLat([114.2, -0.4]),
                zoom: 6,
                minZoom: 4,
                maxZoom: 16,
            }),
            controls: defaultControls({ zoom: false, rotate: false, attribution: true }),
        });

        mapRef.current = map;
        hotspotSourceRef.current = hotspotSource;
        burnedLayerRef.current = burnedLayer;
        labelsRef.current = labels;

        const borneoExtent = transformExtent([108.6, -4.1, 119.5, 4.6], 'EPSG:4326', 'EPSG:3857');
        const frameView = () => {
            map.updateSize();
            const size = map.getSize();
            if (!size?.[0] || !size?.[1]) return;
            map.getView().fit(borneoExtent, {
                size,
                padding: [40, 88, 56, 430],
                maxZoom: 7,
            });
        };
        const resize = () => map.updateSize();
        const frame = window.requestAnimationFrame(frameView);
        window.addEventListener('resize', resize);

        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener('resize', resize);
            map.setTarget(undefined);
            map.dispose();
            mapRef.current = null;
            hotspotSourceRef.current = null;
            burnedLayerRef.current = null;
            labelsRef.current = null;
        };
    }, []);

    useEffect(() => {
        const source = hotspotSourceRef.current;
        if (!source) return;
        source.getFeatures().forEach((feature) => {
            const level = feature.get('confidence');
            feature.setStyle(hotspotOn && confidence[level] ? HOTSPOT_STYLES[level] : HIDDEN_STYLE);
        });
    }, [hotspotOn, confidence]);

    useEffect(() => {
        const layer = burnedLayerRef.current;
        if (!layer) return;
        layer.setVisible(burnedOn);
        layer.setOpacity(opacity / 100);
    }, [burnedOn, opacity]);

    useEffect(() => {
        labelsRef.current?.setVisible(labelsOn);
    }, [labelsOn]);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => mapRef.current?.updateSize());
        return () => window.cancelAnimationFrame(frame);
    }, [panelOpen]);

    useEffect(() => {
        const onKey = (event) => {
            if (event.key === 'Escape') setPanelOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const zoomBy = (delta) => {
        const view = mapRef.current?.getView();
        if (!view) return;
        const current = view.getZoom() || 6;
        const next = Math.min(view.getMaxZoom() ?? 16, Math.max(view.getMinZoom() ?? 4, current + delta));
        view.animate({ zoom: next, duration: 180 });
    };

    const focusSearch = () => {
        setPanelOpen(true);
        window.requestAnimationFrame(() => searchRef.current?.focus());
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const needle = normalize(query);
        if (!needle) {
            setSearchState({ type: 'empty' });
            return;
        }

        const match = REGIONS
            .map((region) => {
                const score = region.keys.reduce((best, key) => {
                    if (key === needle) return 100;
                    if (key.includes(needle)) return Math.max(best, 40 + needle.length);
                    return best;
                }, 0);
                return { region, score };
            })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)[0]?.region;

        if (!match) {
            setSearchState({ type: 'miss' });
            return;
        }

        setSearchState({ type: 'hit', name: match.name });
        mapRef.current?.getView().animate({
            center: fromLonLat(match.center),
            zoom: match.zoom,
            duration: 650,
        });
    };

    const toggleLevel = (level) => {
        setConfidence((prev) => ({ ...prev, [level]: !prev[level] }));
    };

    const downloadHotspots = () => {
        const rows = [['id', 'longitude', 'latitude', 'confidence', 'observed_at']];
        (hotspotSourceRef.current?.getFeatures() || []).forEach((feature) => {
            const level = feature.get('confidence');
            if (!hotspotOn || !confidence[level]) return;
            rows.push([feature.get('id'), feature.get('lon'), feature.get('lat'), level, '2026-08-10 08:02:22']);
        });
        downloadCsv('hotspot-2026-08-10.csv', rows);
    };

    const downloadBurned = () => {
        const rows = [['id', 'region', 'area_ha', 'observed_at']];
        BURNED_AREAS.forEach((area) => {
            rows.push([area.id, area.region, area.areaHa, '2026-08-02 13:10:06']);
        });
        downloadCsv('burned-area-2026-08-02.csv', rows);
    };

    const handleLogout = () => {
        if (isAuthenticated) {
            dispatch(logout());
            navigate('/');
            return;
        }
        navigate('/login');
    };

    const searchMessage = () => {
        if (!searchState) return t('monitoring.searchHint');
        if (searchState.type === 'empty') return t('monitoring.searchEmpty');
        if (searchState.type === 'miss') return t('monitoring.searchMiss');
        return `${t('monitoring.searchHit')} ${searchState.name}`;
    };

    const levels = [
        { id: 'high', icon: iconCircleHigh, label: t('monitoring.high') },
        { id: 'mid', icon: iconCircleMid, label: t('monitoring.mid') },
        { id: 'low', icon: iconCircleLow, label: t('monitoring.low') },
    ];

    return (
        <main className={`mon-page${panelOpen ? ' is-panel-open' : ''}`}>
            <div ref={hostRef} className="mon-map" />

            <aside className="mon-rail" aria-label={t('monitoring.title')}>
                <div className="mon-rail-top">
                    <button type="button" className="mon-rail-logo" onClick={() => navigate('/')} aria-label="SPECTRA">
                        <img src={logoMark} alt="" />
                    </button>
                    <nav className="mon-rail-nav">
                        <button type="button" className="mon-rail-btn" onClick={() => navigate('/')} aria-label={t('monitoring.navHome')}>
                            <img src={iconHome} alt="" />
                        </button>
                        <button type="button" className="mon-rail-btn" onClick={focusSearch} aria-label={t('monitoring.navSearch')}>
                            <img src={iconSearchNav} alt="" />
                        </button>
                        <button
                            type="button"
                            className="mon-rail-fire"
                            aria-current="page"
                            aria-label={t('monitoring.navFire')}
                            onClick={() => setPanelOpen(true)}
                        >
                            <img src={iconFireNav} alt="" />
                        </button>
                        <button type="button" className="mon-rail-quiet" aria-label={t('monitoring.navHistory')}>
                            <img src={iconHistory} alt="" />
                        </button>
                        <button type="button" className="mon-rail-btn" aria-label={t('monitoring.navList')}>
                            <img src={iconList} alt="" />
                        </button>
                    </nav>
                </div>
                <button type="button" className="mon-rail-btn" onClick={handleLogout} aria-label={t('monitoring.navLogout')}>
                    <img src={iconLogout} alt="" />
                </button>
            </aside>

            {panelOpen ? (
                <section className="mon-panel" aria-label={t('monitoring.title')}>
                    <header className="mon-panel-head">
                        <div className="mon-panel-title">
                            <div className="mon-title-row">
                                <img src={iconFireTitle} alt="" />
                                <h1>{t('monitoring.title')}</h1>
                            </div>
                            <p>{t('monitoring.subtitle')}</p>
                        </div>
                        <button type="button" className="mon-icon-btn" onClick={() => setPanelOpen(false)} aria-label={t('monitoring.closePanel')}>
                            <img src={iconClose} alt="" />
                        </button>
                    </header>

                    <div className="mon-panel-scroll">
                        <form className="mon-search" onSubmit={handleSearch}>
                            <h2>{t('monitoring.searchTitle')}</h2>
                            <label className="mon-field">
                                <img src={iconSearch} alt="" />
                                <input
                                    ref={searchRef}
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder={t('monitoring.searchPlaceholder')}
                                    list="mon-region-list"
                                    autoComplete="off"
                                />
                            </label>
                            <datalist id="mon-region-list">
                                {REGIONS.map((region) => (
                                    <option key={region.name} value={region.name} />
                                ))}
                            </datalist>
                            <p className={`mon-hint${searchState?.type === 'miss' ? ' is-warn' : ''}`}>{searchMessage()}</p>
                            <button type="submit" className="mon-btn mon-btn-dark">{t('monitoring.searchAction')}</button>
                        </form>

                        <div className="mon-layers">
                            <article className="mon-card mon-card-hotspot">
                                <header className="mon-card-head">
                                    <div className="mon-card-id">
                                        <img src={iconPin} alt="" />
                                        <div>
                                            <h3>{t('monitoring.hotspotTitle')}</h3>
                                            <p>{t('monitoring.hotspotSubtitle')}</p>
                                        </div>
                                    </div>
                                    <Switch checked={hotspotOn} onChange={setHotspotOn} label={t('monitoring.hotspotTitle')} />
                                </header>
                                <div className="mon-card-body">
                                    <div className="mon-fresh">
                                        <span className="mon-age is-fresh">
                                            <img src={iconLive} alt="" />
                                            {t('monitoring.hotspotAge')}
                                        </span>
                                        <time dateTime="2026-08-10T08:02:22+07:00">{t('monitoring.hotspotTime')}</time>
                                    </div>
                                    <button
                                        type="button"
                                        className={`mon-filter-toggle${hotspotOn ? '' : ' is-muted'}${hotspotFilterOpen ? ' is-open' : ''}`}
                                        aria-expanded={hotspotFilterOpen}
                                        onClick={() => setHotspotFilterOpen((open) => !open)}
                                    >
                                        <span>{t('monitoring.applyFilter')}</span>
                                        <Chevron />
                                    </button>
                                    {hotspotFilterOpen ? (
                                        <div className="mon-filter">
                                            {levels.map((level) => (
                                                <label key={level.id} className="mon-check">
                                                    <input
                                                        type="checkbox"
                                                        checked={confidence[level.id]}
                                                        onChange={() => toggleLevel(level.id)}
                                                    />
                                                    <img src={level.icon} alt="" />
                                                    <span>{level.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : null}
                                    <button type="button" className="mon-btn mon-btn-dark" onClick={downloadHotspots}>
                                        {t('monitoring.downloadData')}
                                        <img src={iconDownload} alt="" />
                                    </button>
                                </div>
                            </article>

                            <article className="mon-card mon-card-burned">
                                <header className="mon-card-head">
                                    <div className="mon-card-id">
                                        <img src={iconFireFill} alt="" />
                                        <div>
                                            <h3>{t('monitoring.burnedTitle')}</h3>
                                            <p>{t('monitoring.burnedSubtitle')}</p>
                                        </div>
                                    </div>
                                    <Switch checked={burnedOn} onChange={setBurnedOn} label={t('monitoring.burnedTitle')} />
                                </header>
                                <div className="mon-card-body">
                                    <div className="mon-fresh mon-fresh-stale">
                                        <span className="mon-age is-stale">
                                            <img src={iconLiveStale} alt="" />
                                            {t('monitoring.burnedAge')}
                                        </span>
                                        <time dateTime="2026-08-02T13:10:06+07:00">{t('monitoring.burnedTime')}</time>
                                    </div>
                                    <label className="mon-opacity">
                                        <img src={iconOpacity} alt="" />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={opacity}
                                            aria-label={t('monitoring.opacity')}
                                            onChange={(event) => setOpacity(Number(event.target.value))}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        className={`mon-filter-toggle${burnedOn ? '' : ' is-muted'}${burnedFilterOpen ? ' is-open' : ''}`}
                                        aria-expanded={burnedFilterOpen}
                                        onClick={() => setBurnedFilterOpen((open) => !open)}
                                    >
                                        <span>{t('monitoring.applyFilter')}</span>
                                        <Chevron />
                                    </button>
                                    {burnedFilterOpen ? (
                                        <p className="mon-filter-note">{t('monitoring.burnedTime')}</p>
                                    ) : null}
                                    <div className="mon-btn-row">
                                        <button type="button" className="mon-btn mon-btn-dark" onClick={downloadBurned}>
                                            {t('monitoring.download')}
                                            <img src={iconDownload} alt="" />
                                        </button>
                                        <button
                                            type="button"
                                            className={`mon-btn mon-btn-light${attributesOpen ? ' is-active' : ''}`}
                                            aria-expanded={attributesOpen}
                                            onClick={() => setAttributesOpen((open) => !open)}
                                        >
                                            {t('monitoring.viewAttributes')}
                                        </button>
                                    </div>
                                    {attributesOpen ? (
                                        <ul className="mon-attrs">
                                            {BURNED_AREAS.map((area) => (
                                                <li key={area.id}>
                                                    <strong>{area.id}</strong>
                                                    <span>{area.region}</span>
                                                    <span>{area.areaHa} ha</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            </article>

                            <article className="mon-context">
                                <header className="mon-card-head">
                                    <img src={iconScene} alt="" />
                                    <div>
                                        <h3>{t('monitoring.spatialTitle')}</h3>
                                        <p>{t('monitoring.spatialSubtitle')}</p>
                                    </div>
                                </header>
                                <ul className="mon-context-list">
                                    <li>
                                        <span className="mon-context-icon"><img src={iconWind} alt="" /></span>
                                        <span>{t('monitoring.wind')}</span>
                                        <Switch checked={windOn} onChange={setWindOn} label={t('monitoring.wind')} />
                                    </li>
                                    <li>
                                        <span className="mon-context-icon"><img src={iconRain} alt="" /></span>
                                        <span>{t('monitoring.rain')}</span>
                                        <Switch checked={rainOn} onChange={setRainOn} label={t('monitoring.rain')} />
                                    </li>
                                    <li>
                                        <span className="mon-context-icon"><img src={iconLand} alt="" /></span>
                                        <span>{t('monitoring.land')}</span>
                                        <Switch checked={landOn} onChange={setLandOn} label={t('monitoring.land')} />
                                    </li>
                                </ul>
                            </article>
                        </div>
                    </div>
                </section>
            ) : null}

            <div className="mon-float">
                <section className="mon-pop">
                    <header>
                        <div>
                            <img src={iconDot} alt="" />
                            <h2>{t('monitoring.lastReport')}</h2>
                        </div>
                        <button
                            type="button"
                            aria-expanded={reportOpen}
                            aria-label={reportOpen ? t('monitoring.collapse') : t('monitoring.expand')}
                            onClick={() => setReportOpen((open) => !open)}
                        >
                            <img src={iconMinimize} alt="" />
                        </button>
                    </header>
                    {reportOpen ? (
                        <div className="mon-report">
                            <div>
                                <strong>1235</strong>
                                <p>
                                    {t('monitoring.hotspotStat')}
                                    <i />
                                    {t('monitoring.hotspotAge')}
                                </p>
                            </div>
                            <div>
                                <strong>315</strong>
                                <p>
                                    {t('monitoring.burnedStat')}
                                    <i />
                                    {t('monitoring.burnedAge')}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </section>

                <section className="mon-pop">
                    <header>
                        <div>
                            <img src={iconLegend} alt="" />
                            <h2>{t('monitoring.legend')}</h2>
                        </div>
                        <button
                            type="button"
                            aria-expanded={legendOpen}
                            aria-label={legendOpen ? t('monitoring.collapse') : t('monitoring.expand')}
                            onClick={() => setLegendOpen((open) => !open)}
                        >
                            <img src={iconMinimize} alt="" />
                        </button>
                    </header>
                    {legendOpen ? (
                        <div className="mon-legend">
                            <div className="mon-legend-intro">
                                <strong>{t('monitoring.confidence')}</strong>
                                <p>{t('monitoring.confidenceHint')}</p>
                            </div>
                            <p className="mon-legend-kicker">
                                <img src={iconCircle} alt="" />
                                {t('monitoring.hotspotPoints')}
                            </p>
                            <ul>
                                <li>
                                    <span><img src={iconCircleHigh} alt="" />{t('monitoring.high')}</span>
                                    <b>{t('monitoring.highValue')}</b>
                                </li>
                                <li>
                                    <span><img src={iconCircleMid} alt="" />{t('monitoring.mid')}</span>
                                    <b>{t('monitoring.midValue')}</b>
                                </li>
                                <li>
                                    <span><img src={iconCircleLow} alt="" />{t('monitoring.low')}</span>
                                    <b>{t('monitoring.lowValue')}</b>
                                </li>
                            </ul>
                            <div className="mon-legend-burned">
                                <p>
                                    <img src={iconPolygon} alt="" />
                                    {t('monitoring.burnedTitle')}
                                </p>
                                <b>{burnedOn ? '' : t('monitoring.none')}</b>
                                {burnedOn ? <i className="mon-swatch" /> : null}
                            </div>
                        </div>
                    ) : null}
                </section>
            </div>

            <div className="mon-controls">
                <button
                    type="button"
                    className={`mon-tool${labelsOn ? ' is-active' : ''}`}
                    aria-pressed={labelsOn}
                    aria-label={t('monitoring.navLayers')}
                    onClick={() => setLabelsOn((on) => !on)}
                >
                    <img src={iconLayers} alt="" />
                </button>
                <div className="mon-zoom">
                    <button type="button" className="mon-tool" aria-label={t('monitoring.zoomIn')} onClick={() => zoomBy(1)}>
                        <img src={iconPlus} alt="" />
                    </button>
                    <button type="button" className="mon-tool" aria-label={t('monitoring.zoomOut')} onClick={() => zoomBy(-1)}>
                        <img src={iconMinus} alt="" />
                    </button>
                </div>
            </div>
        </main>
    );
};

export default Monitoring;
