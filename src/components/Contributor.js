import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import { NEEDED_INFO } from '../utils/activationSession';
import './Stakeholder.scss';
import './Contributor.scss';

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
    { id: 'karhutla', icon: FireIcon, theme: 'fire', category: 'Kebakaran hutan lahan' },
    { id: 'kekeringan', icon: DroughtIcon, theme: 'drought', category: 'Kekeringan' },
    { id: 'banjir', icon: FloodIcon, theme: 'flood', category: 'Banjir' },
    { id: 'longsor', icon: LandslideIcon, theme: 'landslide', category: 'Longsor' },
];

const EVENTS = [
    {
        id: 'evt-001',
        type: 'karhutla',
        status: 'ongoing',
        date: '2026-09-12',
        regionKey: 'riau',
        titleKey: 'riauFire',
    },
    {
        id: 'evt-002',
        type: 'banjir',
        status: 'ongoing',
        date: '2026-09-10',
        regionKey: 'jakarta',
        titleKey: 'jakartaFlood',
    },
    {
        id: 'evt-003',
        type: 'kekeringan',
        status: 'ongoing',
        date: '2026-08-28',
        regionKey: 'ntt',
        titleKey: 'nttDrought',
    },
    {
        id: 'evt-004',
        type: 'longsor',
        status: 'archive',
        date: '2025-11-27',
        regionKey: 'sumbar',
        titleKey: 'sumbarLandslide',
    },
    {
        id: 'evt-005',
        type: 'banjir',
        status: 'archive',
        date: '2025-11-26',
        regionKey: 'aceh',
        titleKey: 'acehFlood',
    },
    {
        id: 'evt-006',
        type: 'karhutla',
        status: 'archive',
        date: '2025-09-18',
        regionKey: 'kalteng',
        titleKey: 'kaltengFire',
    },
];

const DEFAULT_NEEDED = NEEDED_INFO[0].id;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ACCEPT_BY_TYPE = {
    fieldPhoto: 'image/jpeg,image/png,image/webp,image/heic,.jpg,.jpeg,.png,.webp',
    fieldNeeds: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt',
    fieldUpdate: 'image/*,.pdf,.doc,.docx,.txt',
    hiresImage: 'image/jpeg,image/png,image/tiff,.jpg,.jpeg,.png,.tif,.tiff,.jp2',
};

const isAllowedFile = (file, type) => {
    const name = file.name.toLowerCase();
    const mime = file.type || '';
    if (type === 'fieldPhoto') {
        return mime.startsWith('image/') || /\.(jpe?g|png|webp|heic)$/i.test(name);
    }
    if (type === 'hiresImage') {
        return mime.startsWith('image/') || /\.(jpe?g|png|webp|tiff?|jp2)$/i.test(name);
    }
    return mime.startsWith('image/') || mime === 'application/pdf' || /\.(pdf|docx?|xlsx?|txt)$/i.test(name);
};

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const toFileItems = (fileList) =>
    Array.from(fileList).map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

const revokePreviews = (items) => {
    items.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
    });
};

const UploadIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M12 3.2 6.8 8.4l1.4 1.4 2.8-2.8v8.8h2V7l2.8 2.8 1.4-1.4L12 3.2zM5 18.8v2h14v-2H5z"
        />
    </svg>
);

const FileGlyph = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            fill="currentColor"
            d="M14 2H6.5C5.1 2 4 3.1 4 4.5v15C4 20.9 5.1 22 6.5 22h11c1.4 0 2.5-1.1 2.5-2.5V8l-6-6zm0 1.9L18.1 8H14V3.9zM6.5 20c-.3 0-.5-.2-.5-.5v-15c0-.3.2-.5.5-.5H12v6h6v9.5c0 .3-.2.5-.5.5h-11z"
        />
    </svg>
);

const isValidServiceUrl = (value) => {
    try {
        const url = new URL(value.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
        return false;
    }
};

const Contributor = () => {
    const navigate = useNavigate();
    const { t, currentLanguage } = useTranslation();
    const [activityFilter, setActivityFilter] = useState('ongoing');
    const [contributedIds, setContributedIds] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [contributionType, setContributionType] = useState(DEFAULT_NEEDED);
    const [notes, setNotes] = useState('');
    const [serviceUrl, setServiceUrl] = useState('');
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);
    const dragDepth = useRef(0);

    const visibleEvents = useMemo(
        () => EVENTS.filter((event) => event.status === activityFilter),
        [activityFilter]
    );

    useEffect(() => {
        if (!selectedEvent) return undefined;

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setSelectedEvent(null);
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [selectedEvent]);

    const formatDate = (value) => {
        const locale = currentLanguage === 'en' ? 'en-GB' : 'id-ID';
        return new Date(`${value}T00:00:00`).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getEventCopy = (eventItem) => ({
        title: t(`stakeholder.events.${eventItem.titleKey}.title`),
        region: t(`stakeholder.regions.${eventItem.regionKey}`),
        summary: t(`stakeholder.events.${eventItem.titleKey}.summary`),
    });

    const resetUpload = useCallback(() => {
        setFiles((prev) => {
            revokePreviews(prev);
            return [];
        });
        setIsDragging(false);
        dragDepth.current = 0;
        setUploadError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const openContribute = (eventItem) => {
        setSelectedEvent(eventItem);
        setContributionType(DEFAULT_NEEDED);
        setNotes('');
        setServiceUrl('');
        resetUpload();
    };

    const closeContribute = () => {
        setSelectedEvent(null);
        setNotes('');
        setServiceUrl('');
        resetUpload();
    };

    const addFiles = (fileList) => {
        const incoming = Array.from(fileList || []);
        if (!incoming.length) return;

        const rejected = [];
        const accepted = incoming.filter((file) => {
            if (!isAllowedFile(file, contributionType)) {
                rejected.push(file.name);
                return false;
            }
            if (file.size > MAX_FILE_SIZE) {
                rejected.push(file.name);
                return false;
            }
            return true;
        });

        if (rejected.length) {
            setUploadError(t('contributor.form.uploadRejected').replace('{names}', rejected.join(', ')));
        } else {
            setUploadError('');
        }

        if (!accepted.length) return;

        setFiles((prev) => {
            const existing = new Set(prev.map((item) => `${item.file.name}-${item.file.size}-${item.file.lastModified}`));
            const unique = accepted.filter((file) => !existing.has(`${file.name}-${file.size}-${file.lastModified}`));
            return unique.length ? [...prev, ...toFileItems(unique)] : prev;
        });
    };

    const removeFile = (id) => {
        setFiles((prev) => {
            const next = prev.filter((item) => item.id !== id);
            const removed = prev.find((item) => item.id === id);
            if (removed?.preview) URL.revokeObjectURL(removed.preview);
            return next;
        });
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth.current += 1;
        setIsDragging(true);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth.current = 0;
        setIsDragging(false);
        addFiles(event.dataTransfer.files);
    };

    const needsFiles = contributionType === 'fieldPhoto' || contributionType === 'hiresImage';
    const isServiceLink = contributionType === 'serviceLink';
    const serviceUrlValid = isValidServiceUrl(serviceUrl);
    const canSubmit = Boolean(selectedEvent) && (
        isServiceLink
            ? serviceUrlValid
            : needsFiles ? files.length > 0 : (notes.trim().length > 0 || files.length > 0)
    );

    const handleContribute = (event) => {
        event.preventDefault();
        if (!selectedEvent || !canSubmit) return;

        setContributedIds((prev) => (
            prev.includes(selectedEvent.id) ? prev : [selectedEvent.id, ...prev]
        ));
        closeContribute();
    };

    const openEventProducts = () => {
        navigate('/dashboard/map');
    };

    const selectedCopy = selectedEvent ? getEventCopy(selectedEvent) : null;

    return (
        <main className="stakeholder-page contributor-page">
            <section className="stakeholder-hero">
                <div className="hero-overlay" />
                <div className="container hero-grid">
                    <div className="hero-copy">
                        <p className="hero-eyebrow">{t('contributor.eyebrow')}</p>
                        <h1>{t('contributor.title')}</h1>
                        <p className="hero-description">{t('contributor.description')}</p>
                        <div className="hero-actions">
                            <a href="#aktivitas-terkini" className="btn-primary-cta">
                                {t('contributor.heroCta')}
                            </a>
                        </div>
                    </div>
                    <div className="hero-panel" aria-hidden="true">
                        <div className="hero-panel-image" />
                        <div className="hero-panel-card">
                            <span>{t('contributor.heroCardLabel')}</span>
                            <strong>{t('contributor.heroCardValue')}</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section id="aktivitas-terkini" className="stakeholder-activity">
                <div className="container">
                    <header className="activity-header">
                        <div>
                            <p className="section-eyebrow">{t('contributor.activityEyebrow')}</p>
                            <h2>{t('contributor.activityTitle')}</h2>
                            <p>{t('contributor.activitySubtitle')}</p>
                        </div>
                    </header>

                    <div className="activity-tabs" role="tablist" aria-label={t('contributor.activityTitle')}>
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
                                    {EVENTS.filter((item) => item.status === filter).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {visibleEvents.length > 0 ? (
                        <div className="activity-grid">
                            {visibleEvents.map((eventItem) => {
                                const disaster = DISASTER_TYPES.find((item) => item.id === eventItem.type) || DISASTER_TYPES[0];
                                const Icon = disaster.icon;
                                const copy = getEventCopy(eventItem);
                                const hasContributed = contributedIds.includes(eventItem.id);

                                return (
                                    <article key={eventItem.id} className={`activity-card theme-${disaster.theme}`}>
                                        <div className="card-media">
                                            <span className="card-icon">
                                                <Icon />
                                            </span>
                                            <span className={`status-badge status-${eventItem.status}`}>
                                                {t(`stakeholder.status.${eventItem.status}`)}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <p className="card-type">{t(`home.${disaster.id}`)}</p>
                                            <h3>{copy.title}</h3>
                                            <p className="card-meta">
                                                {copy.region} · {formatDate(eventItem.date)}
                                            </p>
                                            <p className="card-summary">{copy.summary}</p>
                                            {hasContributed && (
                                                <p className="contributed-note">{t('contributor.contributed')}</p>
                                            )}
                                            <div className="card-actions">
                                                <button
                                                    type="button"
                                                    className="card-cta card-cta-secondary"
                                                    onClick={openEventProducts}
                                                >
                                                    {t('contributor.viewEvent')}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="card-cta"
                                                    onClick={() => openContribute(eventItem)}
                                                >
                                                    {hasContributed ? t('contributor.contributeAgain') : t('contributor.contribute')}
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
                </div>
            </section>

            {selectedEvent && selectedCopy && (
                <div className="activate-overlay" onClick={closeContribute}>
                    <div
                        className="activate-modal activate-modal--contribute"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="contribute-event-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <header className="activate-header">
                            <div>
                                <p>{t('contributor.contributeEyebrow')}</p>
                                <h2 id="contribute-event-title">{t('contributor.contributeTitle')}</h2>
                            </div>
                            <button type="button" className="activate-close" onClick={closeContribute} aria-label={t('common.close')}>
                                ×
                            </button>
                        </header>
                        <p className="activate-lead">
                            {t('contributor.contributeLead')} <strong>{selectedCopy.title}</strong> — {selectedCopy.region}.
                        </p>
                        <form className="activate-form contribute-form" onSubmit={handleContribute}>
                            <fieldset className="contribute-needed">
                                <legend>{t('activation.neededTitle')}</legend>
                                <div className="contribute-needed-list">
                                    {NEEDED_INFO.map((item) => (
                                        <label
                                            key={item.id}
                                            className={`contribute-needed-option${contributionType === item.id ? ' is-selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="neededInfo"
                                                value={item.id}
                                                checked={contributionType === item.id}
                                                onChange={() => {
                                                    setContributionType(item.id);
                                                    setUploadError('');
                                                    setServiceUrl('');
                                                    if (item.id === 'serviceLink') resetUpload();
                                                }}
                                            />
                                            <span>{t(item.labelKey)}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            {isServiceLink ? (
                                <label className="full-width">
                                    <span>{t('contributor.form.serviceUrl')}</span>
                                    <small className="contribute-field-hint">{t('contributor.form.serviceUrlHint')}</small>
                                    <input
                                        type="url"
                                        name="serviceUrl"
                                        inputMode="url"
                                        autoComplete="url"
                                        value={serviceUrl}
                                        onChange={(event) => setServiceUrl(event.target.value)}
                                        placeholder={t('contributor.form.serviceUrlPlaceholder')}
                                    />
                                    {serviceUrl.trim() && !serviceUrlValid ? (
                                        <p className="contribute-upload-error">{t('contributor.form.serviceUrlInvalid')}</p>
                                    ) : null}
                                </label>
                            ) : (
                                <div className="contribute-upload">
                                    <span className="contribute-upload-label">{t('contributor.form.upload')}</span>
                                    <div
                                        className={`contribute-dropzone${isDragging ? ' is-dragging' : ''}`}
                                        onDragEnter={handleDragEnter}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            id="contribute-files"
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept={ACCEPT_BY_TYPE[contributionType]}
                                            className="contribute-dropzone-input"
                                            aria-label={t('contributor.form.upload')}
                                            onChange={(event) => {
                                                addFiles(event.target.files);
                                                event.target.value = '';
                                            }}
                                        />
                                        <label htmlFor="contribute-files" className="contribute-dropzone-label">
                                            <span className="contribute-dropzone-icon">
                                                <UploadIcon />
                                            </span>
                                            <strong>{t('contributor.form.uploadHint')}</strong>
                                            <span>{t(`contributor.form.uploadTypes.${contributionType}`)}</span>
                                            <em>{t('contributor.form.uploadMax')}</em>
                                        </label>
                                    </div>
                                    {uploadError ? <p className="contribute-upload-error">{uploadError}</p> : null}
                                    {files.length > 0 ? (
                                        <ul className="contribute-files">
                                            {files.map((item) => (
                                                <li key={item.id} className="contribute-file">
                                                    {item.preview ? (
                                                        <img src={item.preview} alt="" className="contribute-file-thumb" />
                                                    ) : (
                                                        <span className="contribute-file-glyph">
                                                            <FileGlyph />
                                                        </span>
                                                    )}
                                                    <div className="contribute-file-meta">
                                                        <strong>{item.file.name}</strong>
                                                        <span>{formatFileSize(item.file.size)}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="contribute-file-remove"
                                                        onClick={() => removeFile(item.id)}
                                                        aria-label={`${t('contributor.form.removeFile')} ${item.file.name}`}
                                                    >
                                                        ×
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            )}

                            <label className="full-width">
                                <span>{t('contributor.form.notes')}</span>
                                <textarea
                                    name="notes"
                                    rows="3"
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    placeholder={t('contributor.form.notesPlaceholder')}
                                />
                            </label>
                            <div className="activate-actions">
                                <button type="button" className="btn-cancel" onClick={closeContribute}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="btn-submit" disabled={!canSubmit}>
                                    {t('contributor.contributeSubmit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Contributor;
