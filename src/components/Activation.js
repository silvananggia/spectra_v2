import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import DashboardLayout from './DashboardLayout';
import {
    ACTIVATORS,
    NEEDED_INFO,
    REGION_TREE,
    applyActivator,
    buildSessionId,
    loadDraft,
    loadSession,
    normalizeActivationForm,
    resolveRegionExtent,
    saveDraft,
    saveSession,
} from '../utils/activationSession';
import OpenLayersMap from './OpenLayersMap';
import iconHelp from '../assets/images/dashboard/icon-help.svg';
import iconChevron from '../assets/images/dashboard/icon-chevron.svg';
import iconStartSession from '../assets/images/activation/icon-start-session.svg';
import iconEdit from '../assets/images/activation/icon-edit.svg';
import iconPlus from '../assets/images/activation/icon-plus.svg';
import iconPan from '../assets/images/activation/icon-pan.svg';
import iconDraw from '../assets/images/activation/icon-draw.svg';
import iconZoomPlus from '../assets/images/activation/icon-zoom-plus.svg';
import iconZoomMinus from '../assets/images/activation/icon-zoom-minus.svg';
import iconArrowRight from '../assets/images/activation/icon-arrow-right.svg';
import iconArrowLeft from '../assets/images/activation/icon-arrow-left.svg';
import './Activation.scss';

const STEPS = [
    { id: 'identity', labelKey: 'activation.steps.identity' },
    { id: 'disaster', labelKey: 'activation.steps.disaster' },
    { id: 'area', labelKey: 'activation.steps.area' },
    { id: 'preview', labelKey: 'activation.steps.preview' },
];

const CATEGORIES = ['banjir', 'longsor', 'kekeringan', 'kebakaran'];
const SEVERITIES = ['ringan', 'sedang', 'berat'];

const RequiredMark = () => <span className="act-required">*</span>;

const Field = ({ label, required, hint, children }) => (
    <label className="act-field">
        <span className="act-field-label">
            {label}
            {required ? <RequiredMark /> : null}
            {hint ? (
                <span className="act-field-hint">
                    <img src={iconHelp} alt="" width={16} height={16} />
                </span>
            ) : null}
        </span>
        {children}
    </label>
);

const SelectControl = ({ value, onChange, disabled, placeholder, children }) => (
    <span className={`act-select${disabled ? ' is-disabled' : ''}`}>
        <select value={value} onChange={onChange} disabled={disabled}>
            <option value="">{placeholder}</option>
            {children}
        </select>
        <img src={iconChevron} alt="" width={20} height={20} />
    </span>
);

const PreviewRow = ({ label, value }) => (
    <div className="act-preview-row">
        <dt>{label}</dt>
        <dd>{value || '—'}</dd>
    </div>
);

const Activation = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(() => normalizeActivationForm(loadDraft() || loadSession()));
    const [modal, setModal] = useState(null);
    const [aoiTool, setAoiTool] = useState('pan');
    const [draftNotice, setDraftNotice] = useState(false);
    const aoiMapRef = useRef(null);
    const previewMapRef = useRef(null);

    useEffect(() => {
        saveDraft(form);
    }, [form]);

    useEffect(() => {
        if (!modal) return undefined;
        const handleEscape = (event) => {
            if (event.key === 'Escape' && modal !== 'prepare') {
                setModal(null);
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [modal]);

    const citiesForProvince = form.province ? Object.keys(REGION_TREE[form.province] || {}) : [];
    const regionExtent = useMemo(
        () => resolveRegionExtent(form.province, form.cities),
        [form.province, form.cities]
    );
    const aoiExtent = form.aoiExtent || (form.province ? regionExtent : null);

    const identityReady = Boolean(form.activatorId);
    const disasterReady = Boolean(
        form.category && form.title.trim() && form.description.trim() && form.startDate && form.duration && form.severity
    );
    const areaReady = Boolean(form.province && form.cities.some((item) => item.city && item.districts.some(Boolean)));
    const stepReady = [identityReady, disasterReady, areaReady, identityReady && disasterReady && areaReady][step];

    const selectedNeeded = useMemo(
        () => NEEDED_INFO.filter((item) => (form.needed || []).includes(item.id)),
        [form.needed]
    );

    const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

    const handleActivatorChange = (activatorId) => {
        setForm((prev) => applyActivator(prev, activatorId));
    };

    const syncAoiFromRegion = (nextForm) => {
        if (nextForm.aoiManual) return nextForm;
        return {
            ...nextForm,
            aoiExtent: nextForm.province ? resolveRegionExtent(nextForm.province, nextForm.cities) : null,
        };
    };

    const handleProvinceChange = (province) => {
        setForm((prev) =>
            syncAoiFromRegion({
                ...prev,
                province,
                cities: [{ city: '', districts: [''] }],
                aoiManual: false,
            })
        );
    };

    const updateCity = (index, city) => {
        setForm((prev) =>
            syncAoiFromRegion({
                ...prev,
                cities: prev.cities.map((item, cityIndex) =>
                    cityIndex === index ? { city, districts: [''] } : item
                ),
            })
        );
    };

    const updateDistrict = (cityIndex, districtIndex, district) => {
        setForm((prev) =>
            syncAoiFromRegion({
                ...prev,
                cities: prev.cities.map((item, index) =>
                    index === cityIndex
                        ? {
                              ...item,
                              districts: item.districts.map((value, innerIndex) =>
                                  innerIndex === districtIndex ? district : value
                              ),
                          }
                        : item
                ),
            })
        );
    };

    const addDistrict = (cityIndex) => {
        setForm((prev) => ({
            ...prev,
            cities: prev.cities.map((item, index) =>
                index === cityIndex ? { ...item, districts: [...item.districts, ''] } : item
            ),
        }));
    };

    const addCity = () => {
        setForm((prev) => ({
            ...prev,
            cities: [...prev.cities, { city: '', districts: [''] }],
        }));
    };

    const toggleNeeded = (id) => {
        setForm((prev) => ({
            ...prev,
            needed: (prev.needed || []).includes(id)
                ? prev.needed.filter((item) => item !== id)
                : [...(prev.needed || []), id],
        }));
    };

    const goNext = () => {
        if (!stepReady) return;
        if (step < STEPS.length - 1) {
            setStep((current) => current + 1);
        } else {
            setModal('confirm');
        }
    };

    const saveAsDraft = () => {
        saveDraft(form);
        setDraftNotice(true);
        window.setTimeout(() => setDraftNotice(false), 2000);
    };

    const startSession = () => {
        setModal('prepare');
        const session = {
            ...form,
            id: buildSessionId(form.category, form.startDate),
            startedAt: new Date().toISOString(),
            dayCurrent: 1,
        };
        window.setTimeout(() => {
            saveSession(session);
            navigate('/dashboard/session');
        }, 2200);
    };

    const formatDate = (value) => {
        if (!value) return '—';
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
    };

    const categoryLabel = form.category ? t(`activation.categories.${form.category}`) : '—';
    const severityLabel = form.severity ? t(`activation.severities.${form.severity}`) : '—';

    return (
        <DashboardLayout activeNav="session">
            <section className="act-page">
                <h1>{t('activation.title')}</h1>

                <ol className="act-steps">
                    {STEPS.map((item, index) => {
                        const state = index < step ? 'done' : index === step ? 'active' : 'todo';
                        return (
                            <li key={item.id} className={`act-step act-step--${state}`}>
                                {index > 0 ? <span className={`act-step-line act-step-line--${index <= step ? 'done' : 'todo'}`} /> : null}
                                <button type="button" className="act-step-dot" onClick={() => index < step && setStep(index)} />
                                <strong>{t(item.labelKey)}</strong>
                                <span>{t('activation.supportText')}</span>
                            </li>
                        );
                    })}
                </ol>

                {step === 0 && (
                    <div className="act-card">
                        <Field label={t('activation.institution')} required>
                            <SelectControl value={form.institution} disabled placeholder={t('activation.pickOne')}>
                                <option value={form.institution}>{form.institution}</option>
                            </SelectControl>
                        </Field>
                        <Field label={t('activation.activator')} required>
                            <SelectControl
                                value={form.activatorId}
                                placeholder={t('activation.pickOne')}
                                onChange={(event) => handleActivatorChange(event.target.value)}
                            >
                                {ACTIVATORS.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </SelectControl>
                        </Field>
                        <Field label={t('activation.position')} required>
                            <SelectControl value={form.position} disabled placeholder={t('activation.pickOne')}>
                                {form.position ? <option value={form.position}>{form.position}</option> : null}
                            </SelectControl>
                        </Field>
                        <div className="act-grid-3">
                            <Field label={t('activation.nip')} required>
                                <input
                                    type="text"
                                    disabled
                                    value={form.nip}
                                    placeholder={t('activation.sessionTitlePlaceholder')}
                                />
                            </Field>
                            <Field label={t('activation.contact')} required>
                                <input
                                    type="text"
                                    disabled
                                    value={form.contact}
                                    placeholder={t('activation.sessionTitlePlaceholder')}
                                />
                            </Field>
                            <Field label={t('activation.authCode')} required>
                                <input
                                    type="text"
                                    disabled
                                    value={form.authCode}
                                    placeholder={t('activation.sessionTitlePlaceholder')}
                                />
                            </Field>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="act-split">
                        <div className="act-card">
                            <h2>{t('activation.generalInfo')}</h2>
                            <Field label={t('activation.category')} required>
                                <SelectControl
                                    value={form.category}
                                    placeholder={t('activation.pickOne')}
                                    onChange={(event) => updateForm({ category: event.target.value })}
                                >
                                    {CATEGORIES.map((item) => (
                                        <option key={item} value={item}>
                                            {t(`activation.categories.${item}`)}
                                        </option>
                                    ))}
                                </SelectControl>
                            </Field>
                            <Field label={t('activation.sessionTitle')} required>
                                <input
                                    type="text"
                                    value={form.title}
                                    placeholder={t('activation.sessionTitlePlaceholder')}
                                    onChange={(event) => updateForm({ title: event.target.value })}
                                />
                            </Field>
                            <Field label={t('activation.description')} required>
                                <textarea
                                    rows={4}
                                    value={form.description}
                                    placeholder="Value"
                                    onChange={(event) => updateForm({ description: event.target.value })}
                                />
                            </Field>
                            <div className="act-grid-2">
                                <Field label={t('activation.startDate')} required>
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(event) => updateForm({ startDate: event.target.value })}
                                    />
                                </Field>
                                <Field label={t('activation.duration')} required>
                                    <span className="act-duration">
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.duration}
                                            placeholder={t('activation.durationPlaceholder')}
                                            onChange={(event) => updateForm({ duration: event.target.value })}
                                        />
                                        <span>{t('activation.days')}</span>
                                    </span>
                                </Field>
                            </div>
                            <Field label={t('activation.severity')} required hint>
                                <SelectControl
                                    value={form.severity}
                                    placeholder={t('activation.pickOne')}
                                    onChange={(event) => updateForm({ severity: event.target.value })}
                                >
                                    {SEVERITIES.map((item) => (
                                        <option key={item} value={item}>
                                            {t(`activation.severities.${item}`)}
                                        </option>
                                    ))}
                                </SelectControl>
                            </Field>
                        </div>
                        <div className="act-card">
                            <h2>{t('activation.neededTitle')}</h2>
                            <div className="act-checks">
                                {NEEDED_INFO.map((item) => (
                                    <label key={item.id} className="act-check">
                                        <input
                                            type="checkbox"
                                            checked={(form.needed || []).includes(item.id)}
                                            onChange={() => toggleNeeded(item.id)}
                                        />
                                        <span>{t(item.labelKey)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="act-split">
                        <div className="act-card">
                            <h2>{t('activation.administrative')}</h2>
                            <Field label={t('activation.province')}>
                                <SelectControl
                                    value={form.province}
                                    placeholder={t('activation.pickOne')}
                                    onChange={(event) => handleProvinceChange(event.target.value)}
                                >
                                    {Object.keys(REGION_TREE).map((province) => (
                                        <option key={province} value={province}>
                                            {province}
                                        </option>
                                    ))}
                                </SelectControl>
                            </Field>
                            {form.cities.map((cityItem, cityIndex) => {
                                const districts = (REGION_TREE[form.province] || {})[cityItem.city] || [];
                                return (
                                    <div key={`city-${cityIndex}`} className="act-city-block">
                                        <Field label={t('activation.city')}>
                                            <SelectControl
                                                value={cityItem.city}
                                                placeholder={t('activation.pickOne')}
                                                onChange={(event) => updateCity(cityIndex, event.target.value)}
                                            >
                                                {citiesForProvince.map((city) => (
                                                    <option key={city} value={city}>
                                                        {city}
                                                    </option>
                                                ))}
                                            </SelectControl>
                                        </Field>
                                        {cityItem.districts.map((district, districtIndex) => (
                                            <Field
                                                key={`district-${cityIndex}-${districtIndex}`}
                                                label={`${t('activation.district')} ${districtIndex + 1}`}
                                            >
                                                <SelectControl
                                                    value={district}
                                                    placeholder={t('activation.pickOne')}
                                                    onChange={(event) =>
                                                        updateDistrict(cityIndex, districtIndex, event.target.value)
                                                    }
                                                >
                                                    {districts.map((name) => (
                                                        <option key={name} value={name}>
                                                            {name}
                                                        </option>
                                                    ))}
                                                </SelectControl>
                                            </Field>
                                        ))}
                                        <button type="button" className="act-add" onClick={() => addDistrict(cityIndex)}>
                                            <img src={iconPlus} alt="" width={16} height={16} />
                                            {t('activation.addDistrict')}
                                        </button>
                                    </div>
                                );
                            })}
                            <button type="button" className="act-add" onClick={addCity}>
                                <img src={iconPlus} alt="" width={16} height={16} />
                                {t('activation.addCity')}
                            </button>
                        </div>
                        <div className="act-card">
                            <h2>{t('activation.aoiTitle')}</h2>
                            <p className="act-aoi-hint">
                                {t('activation.aoiHint')}
                                <span className="act-field-hint">
                                    <img src={iconHelp} alt="" width={16} height={16} />
                                </span>
                            </p>
                            <div className="act-map">
                                <OpenLayersMap
                                    ref={aoiMapRef}
                                    className="act-map-ol"
                                    tool={aoiTool}
                                    aoiExtent={aoiExtent}
                                    fitExtent={regionExtent}
                                    onAoiChange={(extent) =>
                                        updateForm({ aoiExtent: extent, aoiManual: true })
                                    }
                                />
                                <div className="act-map-tools act-map-tools--tl">
                                    <button
                                        type="button"
                                        className={aoiTool === 'pan' ? 'is-active' : ''}
                                        aria-label={t('activation.pan')}
                                        onClick={() => setAoiTool('pan')}
                                    >
                                        <img src={iconPan} alt="" width={20} height={20} />
                                    </button>
                                    <button
                                        type="button"
                                        className={aoiTool === 'draw' ? 'is-active' : ''}
                                        aria-label={t('activation.draw')}
                                        onClick={() => setAoiTool('draw')}
                                    >
                                        <img src={iconDraw} alt="" width={20} height={20} />
                                    </button>
                                </div>
                                <div className="act-map-tools act-map-tools--br">
                                    <button
                                        type="button"
                                        aria-label={t('activation.zoomIn')}
                                        onClick={() => aoiMapRef.current?.zoomBy(1)}
                                    >
                                        <img src={iconZoomPlus} alt="" width={24} height={24} />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={t('activation.zoomOut')}
                                        onClick={() => aoiMapRef.current?.zoomBy(-1)}
                                    >
                                        <img src={iconZoomMinus} alt="" width={24} height={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="act-preview-grid">
                        <article className="act-card">
                            <header className="act-preview-head">
                                <h2>{t('activation.identityTitle')}</h2>
                                <button type="button" className="act-edit" onClick={() => setStep(0)}>
                                    {t('activation.edit')}
                                    <img src={iconEdit} alt="" width={16} height={16} />
                                </button>
                            </header>
                            <dl>
                                <PreviewRow label={t('activation.institution')} value={form.institution} />
                                <PreviewRow label={t('activation.activator')} value={form.activatorName} />
                                <PreviewRow label={t('activation.position')} value={form.position} />
                                <PreviewRow label={t('activation.nip')} value={form.nip} />
                                <PreviewRow label={t('activation.contact')} value={form.contact} />
                                <PreviewRow label={t('activation.authCode')} value={form.authCode} />
                            </dl>
                        </article>
                        <article className="act-card act-preview-area">
                            <header className="act-preview-head">
                                <h2>{t('activation.areaTitle')}</h2>
                                <button type="button" className="act-edit" onClick={() => setStep(2)}>
                                    {t('activation.edit')}
                                    <img src={iconEdit} alt="" width={16} height={16} />
                                </button>
                            </header>
                            <h3>{t('activation.administrative')}</h3>
                            <dl>
                                <PreviewRow label={t('activation.province')} value={form.province} />
                                {form.cities.map((cityItem, cityIndex) => (
                                    <React.Fragment key={`${cityItem.city}-${cityIndex}`}>
                                        <PreviewRow label={t('activation.city')} value={cityItem.city} />
                                        {cityItem.districts.filter(Boolean).map((district, index) => (
                                            <PreviewRow
                                                key={`${cityItem.city}-${district}`}
                                                label={`${t('activation.district')} ${index + 1}`}
                                                value={district}
                                            />
                                        ))}
                                    </React.Fragment>
                                ))}
                            </dl>
                            <h3>{t('activation.aoiTitle')}</h3>
                            <div className="act-preview-map">
                                <OpenLayersMap
                                    ref={previewMapRef}
                                    className="act-preview-ol"
                                    interactive={false}
                                    aoiExtent={aoiExtent}
                                    fitExtent={aoiExtent || regionExtent}
                                />
                            </div>
                        </article>
                        <article className="act-card">
                            <header className="act-preview-head">
                                <h2>{t('activation.disasterTitle')}</h2>
                                <button type="button" className="act-edit" onClick={() => setStep(1)}>
                                    {t('activation.edit')}
                                    <img src={iconEdit} alt="" width={16} height={16} />
                                </button>
                            </header>
                            <h3>{t('activation.generalInfo')}</h3>
                            <dl>
                                <PreviewRow label={t('activation.category')} value={categoryLabel} />
                                <PreviewRow label={t('activation.sessionTitle')} value={form.title} />
                                <PreviewRow label={t('activation.description')} value={form.description} />
                                <PreviewRow label={t('activation.startDate')} value={formatDate(form.startDate)} />
                                <PreviewRow
                                    label={t('activation.duration')}
                                    value={form.duration ? `${form.duration} ${t('activation.days').toLowerCase()}` : '—'}
                                />
                                <PreviewRow label={t('activation.severity')} value={severityLabel} />
                            </dl>
                            <h3>{t('activation.neededTitle')}</h3>
                            <ul className="act-preview-list">
                                {selectedNeeded.map((item) => (
                                    <li key={item.id}>{t(item.labelKey)}</li>
                                ))}
                            </ul>
                        </article>
                    </div>
                )}

                <div className={`act-footer${step === 0 ? ' act-footer--end' : ''}${step === 3 ? ' act-footer--center' : ''}`}>
                    {step > 0 && step < 3 ? (
                        <button type="button" className="act-btn act-btn--outline" onClick={() => setStep((current) => current - 1)}>
                            <img src={iconArrowLeft} alt="" width={16} height={16} />
                            {t('activation.previous')}
                        </button>
                    ) : (
                        <span />
                    )}
                    <div className="act-footer-actions">
                        {draftNotice ? <p className="act-draft-note">{t('activation.draftSaved')}</p> : null}
                        {step > 0 ? (
                            <button type="button" className="act-btn act-btn--outline" onClick={saveAsDraft}>
                                {t('activation.saveDraft')}
                            </button>
                        ) : null}
                        <button type="button" className="act-btn act-btn--primary" disabled={!stepReady} onClick={goNext}>
                            {step === 3 ? t('activation.createSession') : t('activation.next')}
                            {step < 3 ? <img src={iconArrowRight} alt="" width={16} height={16} /> : null}
                        </button>
                    </div>
                </div>
            </section>

            {modal === 'confirm' && (
                <div className="act-overlay" onClick={() => setModal(null)}>
                    <div className="act-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                        <div className="act-modal-title">
                            <span className="act-modal-icon">
                                <img src={iconStartSession} alt="" width={25} height={25} />
                            </span>
                            <h2>{t('activation.confirmTitle').replace('{title}', form.title)}</h2>
                        </div>
                        <p>{t('activation.confirmBody')}</p>
                        <div className="act-modal-actions">
                            <button type="button" className="act-btn act-btn--outline" onClick={() => setModal(null)}>
                                {t('activation.reviewForm')}
                            </button>
                            <button type="button" className="act-btn act-btn--primary" onClick={startSession}>
                                {t('activation.startSession')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modal === 'prepare' && (
                <div className="act-overlay">
                    <div className="act-modal act-modal--prepare" role="dialog" aria-modal="true">
                        <div className="act-progress" aria-hidden="true">
                            <span className="act-progress-bar" />
                        </div>
                        <h2>{t('activation.preparingTitle')}</h2>
                        <p>{t('activation.preparingBody')}</p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Activation;
