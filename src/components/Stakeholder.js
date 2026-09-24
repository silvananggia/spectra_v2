import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import iconActivateWarn from '../assets/images/activation/icon-activate-warn.svg';
import EventSnapshotMap from './EventSnapshotMap';
import DashboardLayout from './DashboardLayout';
import { buildSessionId, ensureLiveSession } from '../utils/activationSession';
import './Stakeholder.scss';

const FireIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M12 2s1.8 3.2.6 5.6c-.7 1.4-2 2.3-2 4 0 1.7 1.3 3 3 3s3-1.3 3-3c0-1.2-.4-2.2-1-3.2 2.3 1.2 4.4 3.6 4.4 6.6 0 3.9-3.1 7-7 7s-7-3.1-7-7C6 7.8 12 2 12 2z"
        />
    </svg>
);

const DroughtIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M6.8 12.1C8 10.4 9.9 9.2 12 9.2s4 1.2 5.2 2.9c.4.6 1.2.7 1.8.3.6-.4.7-1.2.3-1.8C17.6 8.2 14.9 6.5 12 6.5S6.4 8.2 4.7 10.6c-.4.6-.3 1.4.3 1.8.6.4 1.4.3 1.8-.3zM12 3.5c1.4 0 2.5-1.1 2.5-2.5h-5C9.5 2.4 10.6 3.5 12 3.5zm7.4 12.3c-1.6 2.2-4.3 3.6-7.4 3.6s-5.8-1.4-7.4-3.6c-.4-.6-1.2-.7-1.8-.3-.6.4-.7 1.2-.3 1.8C4.8 19.6 8.2 21.5 12 21.5s7.2-1.9 9.5-4.2c.4-.6.3-1.4-.3-1.8-.6-.4-1.4-.3-1.8.3z"
        />
    </svg>
);

const FloodIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M3.5 14.2c1.4-1 2.9-.4 4.3.2 1.4.6 2.8 1.2 4.2.2 1.4-1 2.9-.4 4.3.2 1.2.5 2.4 1 3.7.4v2.3c-1.4 1-2.9.4-4.3-.2-1.4-.6-2.8-1.2-4.2-.2-1.4 1-2.9.4-4.3-.2-1.2-.5-2.4-1-3.7-.4v-2.3zm0 4.2c1.4-1 2.9-.4 4.3.2 1.4.6 2.8 1.2 4.2.2 1.4-1 2.9-.4 4.3.2 1.2.5 2.4 1 3.7.4V21c-1.4 1-2.9.4-4.3-.2-1.4-.6-2.8-1.2-4.2-.2-1.4 1-2.9.4-4.3-.2-1.2-.5-2.4-1-3.7-.4v-2.2zM7.2 4.8 12 8.4l4.8-3.6L19 7.4l-7 5.2-7-5.2 2.2-2.6z"
        />
    </svg>
);

const LandslideIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M2 20.5h20v-2.2L14.8 9.4l-3.2 3.6-2.8-2.4L2 18.3v2.2zm13.2-13.1 1.8-2 4.5 4.1v-2.6L17.2 3.4 15.2 5.6l0 1.8zM8.3 7.2c.9 0 1.7-.8 1.7-1.7S9.2 3.8 8.3 3.8 6.6 4.6 6.6 5.5s.8 1.7 1.7 1.7z"
        />
    </svg>
);

const DISASTER_TYPES = [
    { id: 'karhutla', icon: FireIcon, theme: 'fire', category: 'Kebakaran hutan lahan', marker: '#ea580c' },
    { id: 'kekeringan', icon: DroughtIcon, theme: 'drought', category: 'Kekeringan', marker: '#d97706' },
    { id: 'banjir', icon: FloodIcon, theme: 'flood', category: 'Banjir', marker: '#2563eb' },
    { id: 'longsor', icon: LandslideIcon, theme: 'landslide', category: 'Longsor', marker: '#92400e' },
];

const EVENT_CATEGORY = {
    karhutla: 'kebakaran',
    banjir: 'banjir',
    kekeringan: 'kekeringan',
    longsor: 'longsor',
};

const REGION_PROVINCE = {
    riau: 'Riau',
    jakarta: 'DKI Jakarta',
    ntt: 'Nusa Tenggara Timur',
    sumbar: 'Sumatera Barat',
    aceh: 'Aceh',
    kalteng: 'Kalimantan Tengah',
};

const INITIAL_EVENTS = [
    {
        id: 'evt-001',
        type: 'karhutla',
        status: 'ongoing',
        date: '2026-09-12',
        regionKey: 'riau',
        titleKey: 'riauFire',
        summaryKey: 'riauFire',
        point: [101.45, 1.49],
        zoom: 9,
    },
    {
        id: 'evt-002',
        type: 'banjir',
        status: 'ongoing',
        date: '2026-09-10',
        regionKey: 'jakarta',
        titleKey: 'jakartaFlood',
        summaryKey: 'jakartaFlood',
        point: [106.89, -6.12],
        zoom: 11,
    },
    {
        id: 'evt-003',
        type: 'kekeringan',
        status: 'ongoing',
        date: '2026-08-28',
        regionKey: 'ntt',
        titleKey: 'nttDrought',
        summaryKey: 'nttDrought',
        point: [123.58, -10.17],
        zoom: 9,
    },
    {
        id: 'evt-004',
        type: 'longsor',
        status: 'archive',
        date: '2025-11-27',
        regionKey: 'sumbar',
        titleKey: 'sumbarLandslide',
        summaryKey: 'sumbarLandslide',
        point: [100.37, -0.32],
        zoom: 10,
    },
    {
        id: 'evt-005',
        type: 'banjir',
        status: 'archive',
        date: '2025-11-26',
        regionKey: 'aceh',
        titleKey: 'acehFlood',
        summaryKey: 'acehFlood',
        point: [95.32, 5.55],
        zoom: 10,
    },
    {
        id: 'evt-006',
        type: 'karhutla',
        status: 'archive',
        date: '2025-09-18',
        regionKey: 'kalteng',
        titleKey: 'kaltengFire',
        summaryKey: 'kaltengFire',
        point: [113.92, -2.21],
        zoom: 9,
    },
];

const Stakeholder = () => {
    const navigate = useNavigate();
    const { t, currentLanguage } = useTranslation();
    const [activityFilter, setActivityFilter] = useState('ongoing');
    const [events] = useState(INITIAL_EVENTS);
    const [isActivateOpen, setIsActivateOpen] = useState(false);
    const [activatePhase, setActivatePhase] = useState('form');
    const [password, setPassword] = useState('');

    const visibleEvents = useMemo(
        () => events.filter((event) => event.status === activityFilter),
        [events, activityFilter]
    );

    useEffect(() => {
        if (!isActivateOpen) return undefined;

        const handleEscape = (event) => {
            if (event.key === 'Escape' && activatePhase !== 'preparing') {
                setIsActivateOpen(false);
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isActivateOpen, activatePhase]);

    const formatDate = (value) => {
        const locale = currentLanguage === 'en' ? 'en-GB' : 'id-ID';
        return new Date(`${value}T00:00:00`).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const canSubmit = password.trim().length > 0;

    const openActivateModal = () => {
        setPassword('');
        setActivatePhase('form');
        setIsActivateOpen(true);
    };

    const closeActivateModal = () => {
        if (activatePhase === 'preparing') return;
        setIsActivateOpen(false);
        setPassword('');
        setActivatePhase('form');
    };

    const handleActivate = (event) => {
        event.preventDefault();
        if (!canSubmit) return;
        setActivatePhase('preparing');
        window.setTimeout(() => {
            setIsActivateOpen(false);
            setPassword('');
            setActivatePhase('form');
            navigate('/dashboard/activation');
        }, 1800);
    };

    const openEventProducts = (eventItem, title, summary) => {
        const category = EVENT_CATEGORY[eventItem.type] || 'kebakaran';
        ensureLiveSession({
            id: buildSessionId(category, eventItem.date),
            title,
            category,
            startDate: eventItem.date,
            province: REGION_PROVINCE[eventItem.regionKey] || '',
            description: summary,
            startedAt: new Date().toISOString(),
            dayCurrent: 1,
        });
        navigate('/dashboard/map');
    };

    const openEventDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <DashboardLayout activeNav="stakeholder">
        <div className="stakeholder-page">
            <section className="dash-block">
                <div className="dash-section-title">
                    <h1>{t('stakeholder.activityTitle')}</h1>
                </div>
                <div className="dash-session-banner">
                    <p>
                        {t('stakeholder.description')}
                        <br />
                        {t('stakeholder.activitySubtitle')}
                    </p>
                    <button type="button" className="dash-primary-btn" onClick={openActivateModal}>
                        {t('stakeholder.activate')}
                    </button>
                </div>
            </section>

            <section id="aktivitas-terkini" className="stakeholder-activity">
                    <div className="activity-tabs" role="tablist" aria-label={t('stakeholder.activityTitle')}>
                        {['ongoing', 'archive'].map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                role="tab"
                                className={`activity-tab ${activityFilter === filter ? 'is-active' : ''}`}
                                aria-selected={activityFilter === filter}
                                onClick={() => setActivityFilter(filter)}
                            >
                                {t(`stakeholder.filters.${filter}`)}
                                <span className="tab-count">
                                    {events.filter((item) => item.status === filter).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {visibleEvents.length > 0 ? (
                        <div className="activity-grid">
                            {visibleEvents.map((eventItem) => {
                                const disaster = DISASTER_TYPES.find((item) => item.id === eventItem.type) || DISASTER_TYPES[0];
                                const Icon = disaster.icon;
                                const title = eventItem.customTitle || t(`stakeholder.events.${eventItem.titleKey}.title`);
                                const region = eventItem.customRegion || t(`stakeholder.regions.${eventItem.regionKey}`);
                                const summary = eventItem.customSummary || t(`stakeholder.events.${eventItem.summaryKey}.summary`);

                                return (
                                    <article key={eventItem.id} className={`activity-card theme-${disaster.theme}`}>
                                        <div className="card-media card-media--map">
                                            <EventSnapshotMap
                                                center={eventItem.point}
                                                zoom={eventItem.zoom}
                                                color={disaster.marker}
                                            />
                                            <span className="card-icon">
                                                <Icon />
                                            </span>
                                            <span className={`status-badge status-${eventItem.status}`}>
                                                {t(`stakeholder.status.${eventItem.status}`)}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <p className="card-type">{t(`home.${disaster.id}`)}</p>
                                            <h3>{title}</h3>
                                            <p className="card-meta">
                                                {region} · {formatDate(eventItem.date)}
                                            </p>
                                            <p className="card-summary">{summary}</p>
                                            <div className="card-actions">
                                                <button
                                                    type="button"
                                                    className="card-cta card-cta-secondary"
                                                    onClick={() => openEventProducts(eventItem, title, summary)}
                                                >
                                                    {t('stakeholder.viewEvent')}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="card-cta"
                                                    onClick={openEventDashboard}
                                                >
                                                    {t('stakeholder.viewDashboard')}
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="activity-empty">
                            <p>{t(`stakeholder.empty.${activityFilter}`)}</p>
                        </div>
                    )}
            </section>

            {isActivateOpen && (
                <div className="activate-overlay" onClick={closeActivateModal}>
                    <div
                        className={`activate-modal ${activatePhase === 'preparing' ? 'activate-modal--prepare' : ''}`}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="activate-disaster-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {activatePhase === 'preparing' ? (
                            <>
                                <div className="activate-progress" aria-hidden="true">
                                    <span className="activate-progress-bar" />
                                </div>
                                <h2 id="activate-disaster-title">{t('stakeholder.preparingTitle')}</h2>
                                <p className="activate-lead">{t('stakeholder.preparingBody')}</p>
                            </>
                        ) : (
                            <div className="activate-warn">
                                <span className="activate-warn-icon">
                                    <img src={iconActivateWarn} alt="" width={22} height={29} />
                                </span>
                                <div className="activate-copy">
                                    <h2 id="activate-disaster-title">{t('stakeholder.activateTitle')}</h2>
                                    <p className="activate-lead">{t('stakeholder.activateLead')}</p>
                                    <form className="activate-password-form" onSubmit={handleActivate}>
                                        <label>
                                            <span>{t('stakeholder.passwordLabel')}</span>
                                            <small>{t('stakeholder.passwordHint')}</small>
                                            <input
                                                type="password"
                                                name="activationPassword"
                                                autoComplete="current-password"
                                                placeholder={t('stakeholder.passwordPlaceholder')}
                                                value={password}
                                                onChange={(event) => setPassword(event.target.value)}
                                            />
                                        </label>
                                        <button type="submit" className="activate-submit" disabled={!canSubmit}>
                                            {t('stakeholder.activateSubmit')}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
        </DashboardLayout>
    );
};

export default Stakeholder;
