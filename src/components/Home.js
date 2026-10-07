import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import EventSnapshotMap from './EventSnapshotMap';
import './Home.scss';

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

const DISASTER_TABS = [
    { id: 'karhutla', icon: FireIcon, category: 'Kebakaran hutan lahan', theme: 'fire', marker: '#ea580c' },
    { id: 'kekeringan', icon: DroughtIcon, category: 'Kekeringan', theme: 'drought', marker: '#d97706' },
    { id: 'banjir', icon: FloodIcon, category: 'Banjir', theme: 'flood', marker: '#2563eb' },
    { id: 'longsor', icon: LandslideIcon, category: 'Longsor', theme: 'landslide', marker: '#92400e' },
];

const HOME_EVENTS = [
    {
        id: 'evt-001',
        type: 'karhutla',
        date: '2026-09-12',
        regionKey: 'riau',
        titleKey: 'riauFire',
        point: [101.45, 1.49],
        zoom: 9,
    },
    {
        id: 'evt-002',
        type: 'banjir',
        date: '2026-09-10',
        regionKey: 'jakarta',
        titleKey: 'jakartaFlood',
        point: [106.89, -6.12],
        zoom: 11,
    },
    {
        id: 'evt-003',
        type: 'kekeringan',
        date: '2026-08-28',
        regionKey: 'ntt',
        titleKey: 'nttDrought',
        point: [123.58, -10.17],
        zoom: 9,
    },
    {
        id: 'evt-004',
        type: 'longsor',
        date: '2025-11-27',
        regionKey: 'sumbar',
        titleKey: 'sumbarLandslide',
        point: [100.37, -0.32],
        zoom: 10,
    },
    {
        id: 'evt-005',
        type: 'banjir',
        date: '2025-11-26',
        regionKey: 'aceh',
        titleKey: 'acehFlood',
        point: [95.32, 5.55],
        zoom: 10,
    },
    {
        id: 'evt-006',
        type: 'karhutla',
        date: '2025-09-18',
        regionKey: 'kalteng',
        titleKey: 'kaltengFire',
        point: [113.92, -2.21],
        zoom: 9,
    },
];

const FEATURED_EVENT_COUNT = 3;

const Home = () => {
    const navigate = useNavigate();
    const { t, currentLanguage } = useTranslation();
    const [activeSlide, setActiveSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [activeTab, setActiveTab] = useState(DISASTER_TABS[0].id);
    const [showAllEvents, setShowAllEvents] = useState(false);
    const visibleEvents = showAllEvents ? HOME_EVENTS : HOME_EVENTS.slice(0, FEATURED_EVENT_COUNT);

    const slides = DISASTER_TABS.map((tab) => ({
        id: tab.id,
        title: t(`home.slides.${tab.id}.title`),
        description: t(`home.slides.${tab.id}.description`),
        category: t(`home.${tab.id}`),
        theme: tab.theme,
        to: tab.id === 'karhutla' ? '/monitoring' : `/products?category=${encodeURIComponent(tab.category)}`,
        cta: tab.id === 'karhutla' ? t('home.ongoingCta') : t('home.viewProducts'),
    }));

    useEffect(() => {
        if (isPaused || slides.length <= 1) return undefined;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return undefined;

        const timer = window.setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 7000);

        return () => window.clearInterval(timer);
    }, [isPaused, slides.length]);

    const goToSlide = (index) => {
        const lastIndex = slides.length - 1;
        if (index < 0) {
            setActiveSlide(lastIndex);
            return;
        }
        if (index > lastIndex) {
            setActiveSlide(0);
            return;
        }
        setActiveSlide(index);
    };

    const activeDisaster = DISASTER_TABS.find((tab) => tab.id === activeTab) || DISASTER_TABS[0];
    const ActiveDisasterIcon = activeDisaster.icon;

    const formatDate = (value) => {
        const locale = currentLanguage === 'en' ? 'en-GB' : 'id-ID';
        return new Date(`${value}T00:00:00`).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <main className="home-page">
            <section
                className="disaster-slider"
                aria-roledescription="carousel"
                aria-label={t('home.sliderLabel')}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocusCapture={() => setIsPaused(true)}
                onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        setIsPaused(false);
                    }
                }}
            >
                {slides.map((slide, index) => (
                    <article
                        key={slide.id}
                        className={`disaster-slide theme-${slide.theme} ${index === activeSlide ? 'is-active' : ''}`}
                        aria-hidden={index !== activeSlide}
                    >
                        <div className="slide-overlay" />
                        <div className="slide-content">
                            <span className="slide-badge">{slide.category}</span>
                            <h1 className="slide-title">{slide.title}</h1>
                            <p className="slide-description">{slide.description}</p>
                            <Link to={slide.to} className="slide-cta">
                                {slide.cta}
                            </Link>
                        </div>
                    </article>
                ))}

                <button
                    type="button"
                    className="slider-nav prev"
                    onClick={() => goToSlide(activeSlide - 1)}
                    aria-label={t('home.sliderPrev')}
                >
                    ‹
                </button>
                <button
                    type="button"
                    className="slider-nav next"
                    onClick={() => goToSlide(activeSlide + 1)}
                    aria-label={t('home.sliderNext')}
                >
                    ›
                </button>
                <div className="slider-dots" role="tablist" aria-label={t('home.sliderLabel')}>
                    {slides.map((slide, index) => (
                        <button
                            key={`dot-${slide.id}`}
                            type="button"
                            className={`slider-dot ${index === activeSlide ? 'is-active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`${t('home.sliderLabel')} ${index + 1}`}
                            aria-current={index === activeSlide ? 'true' : undefined}
                        />
                    ))}
                </div>
            </section>

            <section className="spectra-about">
                <div className="container">
                    <div className="about-copy">
                        <p className="about-eyebrow">{t('home.aboutEyebrow')}</p>
                        <h2 className="about-title">{t('home.title')}</h2>
                        <p className="about-subtitle">{t('home.subtitle')}</p>
                        <p className="about-body">{t('home.aboutBody')}</p>
                        <Link to="/profile" className="about-cta">
                            {t('home.aboutCta')}
                        </Link>
                    </div>
                    <ul className="about-points">
                        <li>
                            <span className="point-index">01</span>
                            <div>
                                <h3>{t('home.aboutPoint1Title')}</h3>
                                <p>{t('home.aboutPoint1Text')}</p>
                            </div>
                        </li>
                        <li>
                            <span className="point-index">02</span>
                            <div>
                                <h3>{t('home.aboutPoint2Title')}</h3>
                                <p>{t('home.aboutPoint2Text')}</p>
                            </div>
                        </li>
                        <li>
                            <span className="point-index">03</span>
                            <div>
                                <h3>{t('home.aboutPoint3Title')}</h3>
                                <p>{t('home.aboutPoint3Text')}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            <section className="home-ongoing" aria-labelledby="home-ongoing-title">
                <div className="container">
                    <header className="home-ongoing-header">
                        <p className="about-eyebrow">{t('home.ongoingEyebrow')}</p>
                        <h2 id="home-ongoing-title">{t('home.ongoingTitle')}</h2>
                        <p>{t('home.ongoingSubtitle')}</p>
                    </header>

                    <div className="home-ongoing-grid">
                        {visibleEvents.map((eventItem) => {
                            const disaster = DISASTER_TABS.find((item) => item.id === eventItem.type) || DISASTER_TABS[0];
                            const Icon = disaster.icon;

                            return (
                                <article key={eventItem.id} className={`home-ongoing-card theme-${disaster.theme}`}>
                                    <div className="home-ongoing-map">
                                        <EventSnapshotMap
                                            center={eventItem.point}
                                            zoom={eventItem.zoom}
                                            color={disaster.marker}
                                        />
                                        <span className="home-ongoing-icon">
                                            <Icon />
                                        </span>
                                    </div>
                                    <div className="home-ongoing-body">
                                        <p className="home-ongoing-type">{t(`home.${disaster.id}`)}</p>
                                        <h3>{t(`stakeholder.events.${eventItem.titleKey}.title`)}</h3>
                                        <p className="home-ongoing-meta">
                                            {t(`stakeholder.regions.${eventItem.regionKey}`)} · {formatDate(eventItem.date)}
                                        </p>
                                        <p className="home-ongoing-summary">
                                            {t(`stakeholder.events.${eventItem.titleKey}.summary`)}
                                        </p>
                                        <button
                                            type="button"
                                            className="home-ongoing-cta"
                                            onClick={() => navigate(eventItem.type === 'karhutla' ? '/monitoring' : '/dashboard/map')}
                                        >
                                            {t('home.ongoingCta')}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {!showAllEvents && HOME_EVENTS.length > FEATURED_EVENT_COUNT ? (
                        <div className="home-ongoing-more">
                            <button
                                type="button"
                                className="home-ongoing-more-btn"
                                onClick={() => setShowAllEvents(true)}
                            >
                                {t('home.ongoingMore')}
                            </button>
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="disaster-tabs">
                <div className="container">
                    <header className="tabs-header">
                        <h2>{t('home.tabsHeading')}</h2>
                        <p>{t('home.tabsSubheading')}</p>
                    </header>

                    <div className="tab-list" role="tablist" aria-label={t('home.tabsHeading')}>
                        {DISASTER_TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = tab.id === activeTab;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    id={`disaster-tab-${tab.id}`}
                                    className={`disaster-tab theme-${tab.theme} ${isActive ? 'is-active' : ''}`}
                                    aria-selected={isActive}
                                    aria-controls={`disaster-panel-${tab.id}`}
                                    tabIndex={isActive ? 0 : -1}
                                    onClick={() => setActiveTab(tab.id)}
                                    onKeyDown={(event) => {
                                        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                                        event.preventDefault();
                                        const currentIndex = DISASTER_TABS.findIndex((item) => item.id === activeTab);
                                        const offset = event.key === 'ArrowRight' ? 1 : -1;
                                        const nextIndex = (currentIndex + offset + DISASTER_TABS.length) % DISASTER_TABS.length;
                                        const nextTab = DISASTER_TABS[nextIndex];
                                        setActiveTab(nextTab.id);
                                        window.requestAnimationFrame(() => {
                                            document.getElementById(`disaster-tab-${nextTab.id}`)?.focus();
                                        });
                                    }}
                                >
                                    <span className="tab-icon">
                                        <Icon />
                                    </span>
                                    <span className="tab-label">{t(`home.${tab.id}`)}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div
                        className={`tab-panel theme-${activeDisaster.theme}`}
                        role="tabpanel"
                        id={`disaster-panel-${activeDisaster.id}`}
                        aria-labelledby={`disaster-tab-${activeDisaster.id}`}
                    >
                        <div className="panel-icon">
                            <ActiveDisasterIcon />
                        </div>
                        <div className="panel-copy">
                            <h3>{t(`home.disasters.${activeDisaster.id}.title`)}</h3>
                            <p>{t(`home.disasters.${activeDisaster.id}.description`)}</p>
                            <ul>
                                <li>{t(`home.disasters.${activeDisaster.id}.point1`)}</li>
                                <li>{t(`home.disasters.${activeDisaster.id}.point2`)}</li>
                                <li>{t(`home.disasters.${activeDisaster.id}.point3`)}</li>
                            </ul>
                            <button
                                type="button"
                                className="panel-cta"
                                onClick={() => navigate(
                                    activeDisaster.id === 'karhutla'
                                        ? '/monitoring'
                                        : `/products?category=${encodeURIComponent(activeDisaster.category)}`
                                )}
                            >
                                {activeDisaster.id === 'karhutla' ? t('home.ongoingCta') : t('home.viewProducts')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
