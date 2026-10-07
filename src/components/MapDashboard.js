import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../utils/i18n';
import Header from './Header';
import OpenLayersMap from './OpenLayersMap';
import { INDONESIA_EXTENT, NEEDED_INFO, ensureLiveSession, resolveRegionExtent } from '../utils/activationSession';
import { ANALYSIS_AREAS, SATELLITE_META, buildTimeSeries } from '../utils/mapDashboardCatalog';
import './MapDashboard.scss';

const RAIL_ITEMS = [
    { id: 'description', labelKey: 'mapDashboard.navDescription' },
    { id: 'timeseries', labelKey: 'mapDashboard.navTimeSeries' },
    { id: 'products', labelKey: 'mapDashboard.navProducts' },
    { id: 'download', labelKey: 'mapDashboard.navDownload' },
    { id: 'stats', labelKey: 'mapDashboard.navStats' },
    { id: 'reporting', labelKey: 'mapDashboard.navReporting' },
    { id: 'openapi', labelKey: 'mapDashboard.navOpenApi' },
];

const IconActivation = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M4 21V9.2L12 4l8 5.2V21h-5.2v-7.1H9.2V21H4zm2-2h1.2v-7.1h9.6V19H18V10.1L12 6.2 6 10.1V19zM10.4 9.6h3.2v1.4h-3.2V9.6zm0 3h3.2v1.4h-3.2v-1.4z"
        />
    </svg>
);

const IconTimeSeries = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M7 3h2v2h6V3h2v2h2.2c.9 0 1.6.7 1.6 1.6v12.8c0 .9-.7 1.6-1.6 1.6H4.8c-.9 0-1.6-.7-1.6-1.6V6.6c0-.9.7-1.6 1.6-1.6H7V3zm11.2 8.2H5.8v8.2h12.4v-8.2zM8 13.2h3.2v2.4H8v-2.4zm4.4 0H16v2.4h-3.6v-2.4z"
        />
    </svg>
);

const IconProducts = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M12 3.2 3.5 7.4v.9L12 12.5l8.5-4.2v-.9L12 3.2zm0 10.6L4.4 10v2.1L12 16.3l7.6-4.2V10L12 13.8zm0 4.1L4.4 14.1v2.1L12 20.4l7.6-4.2v-2.1L12 17.9z"
        />
    </svg>
);

const IconDownload = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M12 3.5v10.2l3.4-3.4 1.1 1.1-5.3 5.3-5.3-5.3 1.1-1.1 3.4 3.4V3.5H12zM5 19.2h14v1.6H5v-1.6z" />
    </svg>
);

const IconStats = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M4.5 19.5h15v1.6h-15v-1.6zm2.2-1.8V11h2.2v6.7H6.7zm4.4 0V6.8h2.2v10.9h-2.2zm4.4 0V9.2h2.2v8.5h-2.2z" />
    </svg>
);

const IconReporting = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M6.2 4.4h11.6c.9 0 1.6.7 1.6 1.6v12c0 .9-.7 1.6-1.6 1.6H6.2c-.9 0-1.6-.7-1.6-1.6v-12c0-.9.7-1.6 1.6-1.6zm0 1.6v12h11.6v-12H6.2zm2.2 2.2h7.2v1.4H8.4V8.2zm0 3h7.2v1.4H8.4v-1.4zm0 3h5v1.4h-5V14.2z"
        />
    </svg>
);

const IconOpenApi = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M8.1 6.4 3.5 12l4.6 5.6 1.3-1.1L6 12l3.4-4.5-1.3-1.1zm7.8 0-1.3 1.1L18 12l-3.4 4.5 1.3 1.1 4.6-5.6-4.6-5.6z"
        />
    </svg>
);

const IconSummaryDownload = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M12 3.2v9.4l3.2-3.2 1.1 1.1-5.1 5.1-5.1-5.1 1.1-1.1 3.2 3.2V3.2H12zM5 18.4h14V20H5v-1.6z" />
    </svg>
);

const IconRoads = () => (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M8 38 18 8h12l10 30h-7.2l-1.6-5.2H16.8L15.2 38H8zm10.2-9.6h11.6L26.6 14h-5.2l-3.2 14.4z" />
        <circle cx="38.5" cy="13.5" r="7.5" fill="currentColor" />
        <path fill="#fff" d="M37.4 9.4h2.2v5.2h-2.2V9.4zm0 6.4h2.2v2.2h-2.2v-2.2z" />
    </svg>
);

const IconPopulation = () => (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M24 8.5a6.2 6.2 0 1 1 0 12.4 6.2 6.2 0 0 1 0-12.4zm-10.5 14.2a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2zm21 0a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2zM8.8 35.4c0-4.4 6.1-6.6 10.7-6.6.7 0 1.5.1 2.2.2-1.8 1.3-3 3.2-3 5.4v3.6H8.8v-2.6zm30.4 0v2.6h-9.9v-3.6c0-2.2-1.2-4.1-3-5.4.7-.1 1.5-.2 2.2-.2 4.6 0 10.7 2.2 10.7 6.6zM16.8 38.2v-2.8c0-3.5 4.6-5.4 7.2-5.4s7.2 1.9 7.2 5.4v2.8H16.8z" />
    </svg>
);

const IconBuiltUp = () => (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M8 38V22.2L24 10l16 12.2V38h-7.4V26.6h-8.4V38H8z" />
        <circle cx="38.5" cy="13.5" r="7.5" fill="currentColor" />
        <path fill="#fff" d="M37.4 9.4h2.2v5.2h-2.2V9.4zm0 6.4h2.2v2.2h-2.2v-2.2z" />
    </svg>
);

const IconBuildings = () => (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M8 38V18.5L20 10v28H8zm16 0V22h16v16H24zM12.2 22.2h3.2V26h-3.2v-3.8zm0 6.2h3.2v3.8h-3.2V28.4zm16 0h3.2v3.8h-3.2V28.4zm5.6 0H37v3.8h-3.2V28.4z" />
        <circle cx="38.5" cy="13.5" r="7.5" fill="currentColor" />
        <path fill="#fff" d="M37.4 9.4h2.2v5.2h-2.2V9.4zm0 6.4h2.2v2.2h-2.2v-2.2z" />
    </svg>
);

const ACTIVATION_STATS = {
    maxExtentHa: 1580,
    roadsKm: 70,
    population: 7600,
    builtUpHa: 10,
    buildings: 4685,
};

const formatStat = (value) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const RAIL_ICONS = {
    description: IconActivation,
    timeseries: IconTimeSeries,
    products: IconProducts,
    download: IconDownload,
    stats: IconStats,
    reporting: IconReporting,
    openapi: IconOpenApi,
};

const formatDate = (value) => {
    if (!value) return '—';
    const [year, month, day] = String(value).split('-');
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
};

const formatShortDate = (value) => {
    if (!value) return '—';
    const [, month, day] = String(value).split('-');
    if (!month || !day) return value;
    return `${day}/${month}`;
};

const IconTimelinePrev = () => (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M10.2 3.4 5.6 8l4.6 4.6.9-.9L7.4 8l3.7-3.7-.9-.9z" />
    </svg>
);

const IconTimelineNext = () => (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M5.8 3.4 10.4 8 5.8 12.6l-.9-.9L8.6 8 4.9 4.3l.9-.9z" />
    </svg>
);

const IconChevron = ({ open }) => (
    <svg className={`map-dash-chevron${open ? ' is-open' : ''}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M6.2 3.4 10.8 8 6.2 12.6l-.9-.9L9 8 5.3 4.3l.9-.9z" />
    </svg>
);

const IconZoom = () => (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M4 4h5v1.5H5.5V9H4V4zm7 0h5v5h-1.5V5.5H11V4zM4 11h1.5v3.5H9V16H4v-5zm10.5 3.5V11H16v5h-5v-1.5h3.5z"
        />
    </svg>
);

const IconDownloadSmall = () => (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M10 3v8.1l2.6-2.6.9.9L10 13.9 6.5 9.4l.9-.9L10 11.1V3h0zm-5 12.4h10V17H5v-1.6z" />
    </svg>
);

const allProductIds = (areas) => areas.flatMap((area) => area.products.map((product) => product.id));

const InfoRow = ({ label, value }) => (
    <div>
        <dt>{label}</dt>
        <dd>{value || '—'}</dd>
    </div>
);

const MapDashboard = () => {
    const { t } = useTranslation();
    const session = useMemo(() => ensureLiveSession(), []);
    const [panelOpen, setPanelOpen] = useState(true);
    const [activeNav, setActiveNav] = useState('description');
    const [areas, setAreas] = useState(ANALYSIS_AREAS);
    const [timeSeries] = useState(() => buildTimeSeries(session?.startDate));
    const [enabledSatellites, setEnabledSatellites] = useState(() =>
        Object.fromEntries(SATELLITE_META.map((sat) => [sat.id, true]))
    );
    const [activeDate, setActiveDate] = useState(null);

    const mapExtent = session?.aoiExtent || resolveRegionExtent(session?.province, session?.cities) || INDONESIA_EXTENT;
    const eventCode = session?.id || t('mapDashboard.noSessionCode');
    const eventTitle = session?.title?.trim() || t('mapDashboard.noSessionTitle');
    const eventStatus = session?.startedAt
        ? t('mapDashboard.statusActive')
        : session
            ? t('mapDashboard.statusDraft')
            : t('mapDashboard.statusClosed');
    const categoryLabel = session?.category ? t(`activation.categories.${session.category}`) : '—';
    const severityLabel = session?.severity ? t(`activation.severities.${session.severity}`) : '—';
    const neededLabels = (session?.needed || [])
        .map((id) => NEEDED_INFO.find((item) => item.id === id)?.labelKey)
        .filter(Boolean)
        .map((key) => t(key));

    const productIds = useMemo(() => allProductIds(areas), [areas]);
    const checkedCount = areas.reduce(
        (count, area) => count + area.products.filter((product) => product.checked).length,
        0
    );
    const allChecked = productIds.length > 0 && checkedCount === productIds.length;
    const timeSeriesGroups = useMemo(
        () =>
            SATELLITE_META.map((sat) => ({
                ...sat,
                scenes: timeSeries.filter((item) => item.satelliteId === sat.id),
                enabled: Boolean(enabledSatellites[sat.id]),
            })),
        [enabledSatellites, timeSeries]
    );
    const timelineDates = useMemo(() => {
        const byDate = new Map();
        timeSeries.forEach((item) => {
            if (!enabledSatellites[item.satelliteId]) return;
            if (!byDate.has(item.date)) byDate.set(item.date, []);
            byDate.get(item.date).push(item);
        });
        return [...byDate.entries()]
            .sort(([left], [right]) => (left < right ? -1 : 1))
            .map(([date, scenes]) => ({ date, scenes }));
    }, [enabledSatellites, timeSeries]);
    const enabledCount = timeSeriesGroups.filter((group) => group.enabled).length;
    const allSatellitesEnabled = enabledCount === timeSeriesGroups.length;
    const resolvedActiveDate =
        (activeDate && timelineDates.some((item) => item.date === activeDate) && activeDate) ||
        timelineDates[timelineDates.length - 1]?.date ||
        null;
    const activeTimeline = timelineDates.find((item) => item.date === resolvedActiveDate);
    const activeDateIndex = timelineDates.findIndex((item) => item.date === resolvedActiveDate);
    const activeDateButtonRef = useRef(null);

    useEffect(() => {
        const button = activeDateButtonRef.current;
        if (!button) return;
        const scroller = button.parentElement;
        if (!scroller) return;
        const target = button.offsetLeft - scroller.clientWidth / 2 + button.offsetWidth / 2;
        scroller.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }, [resolvedActiveDate]);

    const selectNav = (id) => {
        setActiveNav(id);
        setPanelOpen(true);
    };

    const toggleArea = (areaId) => {
        setAreas((current) =>
            current.map((area) => (area.id === areaId ? { ...area, expanded: !area.expanded } : area))
        );
    };

    const setProductChecked = (ids, checked) => {
        const idSet = new Set(ids);
        setAreas((current) =>
            current.map((area) => ({
                ...area,
                products: area.products.map((product) =>
                    idSet.has(product.id) ? { ...product, checked } : product
                ),
            }))
        );
    };

    const setSatellitesEnabled = (ids, enabled) => {
        setEnabledSatellites((current) => {
            const next = { ...current };
            ids.forEach((id) => {
                next[id] = enabled;
            });
            return next;
        });
    };

    const toggleSatelliteLayer = (satelliteId) => {
        setEnabledSatellites((current) => ({ ...current, [satelliteId]: !current[satelliteId] }));
    };

    const selectTimelineDate = (date) => {
        setActiveDate(date);
    };

    const stepTimeline = (direction) => {
        const next = timelineDates[activeDateIndex + direction];
        if (next) setActiveDate(next.date);
    };

    const toggleProductDetails = (productId) => {
        setAreas((current) =>
            current.map((area) => ({
                ...area,
                products: area.products.map((product) =>
                    product.id === productId ? { ...product, detailsOpen: !product.detailsOpen } : product
                ),
            }))
        );
    };

    const downloadStatsSummary = () => {
        const rows = [
            [t('mapDashboard.statsMaxExtent'), `${ACTIVATION_STATS.maxExtentHa} ha`],
            [t('mapDashboard.statsRoads'), `${ACTIVATION_STATS.roadsKm} km`],
            [t('mapDashboard.statsPopulation'), String(ACTIVATION_STATS.population)],
            [t('mapDashboard.statsBuiltUp'), `${ACTIVATION_STATS.builtUpHa} ha`],
            [t('mapDashboard.statsBuildings'), String(ACTIVATION_STATS.buildings)],
        ];
        const csv = [`${eventCode},${eventTitle}`, ...rows.map((row) => row.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${eventCode || 'activation'}-summary.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="map-dash-page">
            <Header variant="app" />
            <div className={`map-dash${panelOpen ? ' map-dash--panel' : ''}${timeSeries.length > 0 ? ' map-dash--timeline' : ''}`}>
            <div className="map-dash-bg">
                <OpenLayersMap
                    className="map-dash-ol"
                    fitExtent={mapExtent}
                    aoiExtent={session?.aoiExtent || undefined}
                    showAoi={Boolean(session?.aoiExtent)}
                />
            </div>

            <aside className="map-dash-rail" aria-label={t('mapDashboard.navLabel')}>
                {RAIL_ITEMS.map((item) => {
                    const Icon = RAIL_ICONS[item.id];
                    return (
                        <button
                            key={item.id}
                            type="button"
                            className={`map-dash-rail-item${activeNav === item.id ? ' is-active' : ''}`}
                            aria-current={activeNav === item.id ? 'page' : undefined}
                            onClick={() => selectNav(item.id)}
                        >
                            <Icon />
                            <span>{t(item.labelKey)}</span>
                        </button>
                    );
                })}
            </aside>

            {panelOpen && (
                <aside className="map-dash-panel" aria-label={t(RAIL_ITEMS.find((item) => item.id === activeNav)?.labelKey || 'mapDashboard.navDescription')}>
                    <header className="map-dash-event">
                        <div className="map-dash-event-top">
                            <span className="map-dash-event-code">{eventCode}</span>
                            <span className={`map-dash-event-status${session?.startedAt ? ' is-active' : ''}`}>{eventStatus}</span>
                        </div>
                        <h1>{eventTitle}</h1>
                    </header>

                    {activeNav === 'description' ? (
                        session ? (
                            <div className="map-dash-info">
                                <h2>{t('mapDashboard.navDescription')}</h2>
                                <section>
                                    <h3>{t('activation.identityTitle')}</h3>
                                    <dl>
                                        <InfoRow label={t('mapDashboard.fieldInstitution')} value={session.institution} />
                                        <InfoRow label={t('mapDashboard.fieldActivator')} value={session.activatorName} />
                                        <InfoRow label={t('mapDashboard.fieldPosition')} value={session.position} />
                                        <InfoRow label={t('mapDashboard.fieldNip')} value={session.nip} />
                                        <InfoRow label={t('mapDashboard.fieldContact')} value={session.contact} />
                                        <InfoRow label={t('mapDashboard.fieldAuthCode')} value={session.authCode} />
                                    </dl>
                                </section>
                                <section>
                                    <h3>{t('activation.disasterTitle')}</h3>
                                    <dl>
                                        <InfoRow label={t('activation.category')} value={categoryLabel} />
                                        <InfoRow label={t('activation.sessionTitle')} value={session.title} />
                                        <InfoRow label={t('activation.description')} value={session.description} />
                                        <InfoRow label={t('activation.startDate')} value={formatDate(session.startDate)} />
                                        <InfoRow
                                            label={t('activation.duration')}
                                            value={session.duration ? `${session.duration} ${t('activation.days').toLowerCase()}` : '—'}
                                        />
                                        <InfoRow label={t('activation.severity')} value={severityLabel} />
                                        <InfoRow
                                            label={t('activation.neededTitle')}
                                            value={neededLabels.length ? neededLabels.join(', ') : '—'}
                                        />
                                    </dl>
                                </section>
                                <section>
                                    <h3>{t('activation.areaTitle')}</h3>
                                    <dl>
                                        <InfoRow label={t('activation.province')} value={session.province} />
                                        {session.cities?.map((cityItem, cityIndex) => (
                                            <React.Fragment key={`${cityItem.city}-${cityIndex}`}>
                                                <InfoRow label={t('activation.city')} value={cityItem.city} />
                                                {cityItem.districts?.filter(Boolean).map((district, index) => (
                                                    <InfoRow
                                                        key={`${cityItem.city}-${district}-${index}`}
                                                        label={`${t('activation.district')} ${index + 1}`}
                                                        value={district}
                                                    />
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </dl>
                                </section>
                            </div>
                        ) : (
                            <div className="map-dash-placeholder">
                                <h2>{t('mapDashboard.navDescription')}</h2>
                                <p>{t('mapDashboard.noSession')}</p>
                            </div>
                        )
                    ) : activeNav === 'timeseries' ? (
                        <div className="map-dash-timeseries">
                            <h2>{t('mapDashboard.navTimeSeries')}</h2>
                            <p>{t('mapDashboard.timeSeriesHint')}</p>
                            {timeSeriesGroups.length > 0 ? (
                                <>
                                    <label className="map-dash-tree-row map-dash-tree-row--all">
                                        <input
                                            type="checkbox"
                                            checked={allSatellitesEnabled}
                                            ref={(element) => {
                                                if (element) {
                                                    element.indeterminate =
                                                        enabledCount > 0 && !allSatellitesEnabled;
                                                }
                                            }}
                                            onChange={() =>
                                                setSatellitesEnabled(
                                                    timeSeriesGroups.map((group) => group.id),
                                                    !allSatellitesEnabled
                                                )
                                            }
                                        />
                                        <span>{t('mapDashboard.allSatellites')}</span>
                                    </label>
                                    <ul className="map-dash-tree">
                                        {timeSeriesGroups.map((group) => (
                                            <li key={group.id} className="map-dash-sat">
                                                <label className="map-dash-tree-row">
                                                    <input
                                                        type="checkbox"
                                                        checked={group.enabled}
                                                        onChange={() => toggleSatelliteLayer(group.id)}
                                                    />
                                                    <span
                                                        className="map-dash-sat-dot"
                                                        style={{ background: group.color }}
                                                    />
                                                    <span className="map-dash-sat-name">
                                                        {group.sensor}
                                                        <small>
                                                            {t(group.typeKey)} · {group.resolution} · {group.platform}
                                                        </small>
                                                    </span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p>{t('mapDashboard.timeSeriesEmpty')}</p>
                            )}
                        </div>
                    ) : activeNav === 'products' ? (
                        <div className="map-dash-products">
                            <h2>{t('mapDashboard.productsTitle')}</h2>

                            <label className="map-dash-tree-row map-dash-tree-row--all">
                                <input
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={() => setProductChecked(productIds, !allChecked)}
                                />
                                <span>{t('mapDashboard.allProducts')}</span>
                            </label>

                            <ul className="map-dash-tree">
                                {areas.map((area, index) => (
                                        <li key={area.id} className="map-dash-area">
                                            <div className="map-dash-tree-row map-dash-tree-row--area">
                                                <button
                                                    type="button"
                                                    className="map-dash-toggle"
                                                    aria-expanded={area.expanded}
                                                    aria-label={t(area.nameKey)}
                                                    onClick={() => toggleArea(area.id)}
                                                >
                                                    <IconChevron open={area.expanded} />
                                                </button>
                                                <button type="button" className="map-dash-area-name" onClick={() => toggleArea(area.id)}>
                                                    {area.kind === 'source'
                                                        ? t(area.nameKey)
                                                        : `${String(index + 1).padStart(2, '0')} ${t(area.nameKey)}`}
                                                </button>
                                            </div>

                                            {area.expanded && area.products.length > 0 && (
                                                <ul className="map-dash-products-list">
                                                    {area.products.map((product) => (
                                                        <li key={product.id} className="map-dash-product">
                                                            <div className="map-dash-tree-row map-dash-tree-row--product">
                                                                <label>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={product.checked}
                                                                        onChange={() => setProductChecked([product.id], !product.checked)}
                                                                    />
                                                                    <span>{t(product.nameKey)}</span>
                                                                </label>
                                                                <div className="map-dash-product-tools">
                                                                    {product.downloadable && (
                                                                        <button type="button" aria-label={t('mapDashboard.download')}>
                                                                            <IconDownloadSmall />
                                                                        </button>
                                                                    )}
                                                                    <button type="button" aria-label={t('mapDashboard.zoomTo')}>
                                                                        <IconZoom />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {product.status === 'completed' && (
                                                                <p className="map-dash-product-status is-done">
                                                                    {t('mapDashboard.completed').replace('{time}', product.completedAt)}
                                                                </p>
                                                            )}
                                                            {product.status === 'notProduced' && (
                                                                <p className="map-dash-product-status is-missing">
                                                                    {t('mapDashboard.notProduced')}
                                                                </p>
                                                            )}

                                                            {product.details && (
                                                                <div className="map-dash-details">
                                                                    <button
                                                                        type="button"
                                                                        className="map-dash-details-toggle"
                                                                        onClick={() => toggleProductDetails(product.id)}
                                                                    >
                                                                        {t('mapDashboard.productDetails')}
                                                                    </button>
                                                                    {product.detailsOpen && (
                                                                        <dl>
                                                                            <div>
                                                                                <dt>{t('mapDashboard.sensor')}</dt>
                                                                                <dd>{product.details.sensor}</dd>
                                                                            </div>
                                                                            <div>
                                                                                <dt>{t('mapDashboard.acquisitionTime')}</dt>
                                                                                <dd>{t(product.details.acquisitionKey)}</dd>
                                                                            </div>
                                                                            <div>
                                                                                <dt>{t('mapDashboard.reason')}</dt>
                                                                                <dd>
                                                                                    {t(product.details.reasonKey)}{' '}
                                                                                    <button type="button" className="map-dash-why">
                                                                                        {t('mapDashboard.why')}
                                                                                    </button>
                                                                                </dd>
                                                                            </div>
                                                                        </dl>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                ))}
                            </ul>
                        </div>
                    ) : activeNav === 'stats' ? (
                        <div className="map-dash-stats">
                            <h2>{t('mapDashboard.navStats')}</h2>
                            <button type="button" className="map-dash-summary" onClick={downloadStatsSummary}>
                                <IconSummaryDownload />
                                <span>
                                    <strong>{t('mapDashboard.statsSummary')}</strong>
                                    <small>{t('mapDashboard.statsSummaryFile')}</small>
                                </span>
                            </button>
                            <p className="map-dash-stats-label">{t('mapDashboard.statsMaxExtent')}</p>
                            <p className="map-dash-stats-hero">
                                {formatStat(ACTIVATION_STATS.maxExtentHa)} <span>ha</span>
                            </p>
                            <p className="map-dash-stats-label">{t('mapDashboard.statsAffected')}</p>
                            <div className="map-dash-stats-grid">
                                <article>
                                    <IconRoads />
                                    <div>
                                        <strong>{formatStat(ACTIVATION_STATS.roadsKm)}</strong>
                                        <span>{t('mapDashboard.statsRoads')}</span>
                                    </div>
                                </article>
                                <article>
                                    <IconPopulation />
                                    <div>
                                        <strong>{formatStat(ACTIVATION_STATS.population)}</strong>
                                        <span>{t('mapDashboard.statsPopulation')}</span>
                                    </div>
                                </article>
                                <article>
                                    <IconBuiltUp />
                                    <div>
                                        <strong>{formatStat(ACTIVATION_STATS.builtUpHa)}</strong>
                                        <span>{t('mapDashboard.statsBuiltUp')}</span>
                                    </div>
                                </article>
                                <article>
                                    <IconBuildings />
                                    <div>
                                        <strong>{formatStat(ACTIVATION_STATS.buildings)}</strong>
                                        <span>{t('mapDashboard.statsBuildings')}</span>
                                    </div>
                                </article>
                            </div>
                        </div>
                    ) : (
                        <div className="map-dash-placeholder">
                            <h2>{t(RAIL_ITEMS.find((item) => item.id === activeNav)?.labelKey)}</h2>
                            <p>{t('mapDashboard.placeholder')}</p>
                        </div>
                    )}
                </aside>
            )}

            {timeSeries.length > 0 && (
                <div className="map-dash-timeline" aria-label={t('mapDashboard.timelineLabel')}>
                    <div className="map-dash-timeline-head">
                        <button
                            type="button"
                            className="map-dash-timeline-step"
                            aria-label={t('mapDashboard.timelinePrev')}
                            disabled={activeDateIndex <= 0}
                            onClick={() => stepTimeline(-1)}
                        >
                            <IconTimelinePrev />
                        </button>
                        <div className="map-dash-timeline-current">
                            <strong>{formatDate(resolvedActiveDate)}</strong>
                            <small>
                                {(activeTimeline?.scenes || []).map((scene) => scene.sensor).join(' · ') ||
                                    t('mapDashboard.timelineEmpty')}
                            </small>
                        </div>
                        <button
                            type="button"
                            className="map-dash-timeline-step"
                            aria-label={t('mapDashboard.timelineNext')}
                            disabled={activeDateIndex < 0 || activeDateIndex >= timelineDates.length - 1}
                            onClick={() => stepTimeline(1)}
                        >
                            <IconTimelineNext />
                        </button>
                    </div>
                    {timelineDates.length > 0 ? (
                        <div className="map-dash-timeline-dates" role="listbox" aria-label={t('mapDashboard.timelineLabel')}>
                            {timelineDates.map((point) => (
                                <button
                                    key={point.date}
                                    type="button"
                                    role="option"
                                    aria-selected={point.date === resolvedActiveDate}
                                    className={`map-dash-timeline-date${
                                        point.date === resolvedActiveDate ? ' is-active' : ''
                                    }`}
                                    ref={point.date === resolvedActiveDate ? activeDateButtonRef : undefined}
                                    onClick={() => selectTimelineDate(point.date)}
                                >
                                    <span className="map-dash-timeline-dots">
                                        {point.scenes.map((scene) => (
                                            <i
                                                key={scene.id}
                                                className="is-on"
                                                style={{ background: scene.color }}
                                            />
                                        ))}
                                    </span>
                                    <span>{formatShortDate(point.date)}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="map-dash-timeline-empty">{t('mapDashboard.timelineEmpty')}</p>
                    )}
                    <ul className="map-dash-timeline-legend">
                        {SATELLITE_META.map((sat) => (
                            <li key={sat.id} className={enabledSatellites[sat.id] ? '' : 'is-off'}>
                                <i style={{ background: sat.color }} />
                                {sat.sensor}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {panelOpen && (
                <button
                    type="button"
                    className="map-dash-map-close"
                    aria-label={t('mapDashboard.closePanel')}
                    onClick={() => setPanelOpen(false)}
                >
                    ×
                </button>
            )}
            </div>
        </div>
    );
};

export default MapDashboard;
