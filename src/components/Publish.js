import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../utils/i18n';
import { ensureLiveSession } from '../utils/activationSession';
import { ANALYSIS_AREAS, SATELLITE_META, buildTimeSeries } from '../utils/mapDashboardCatalog';
import { loadPublishedIds, savePublishedIds } from '../utils/publishSession';
import './Publish.scss';

const formatDate = (value, language) => {
    const locale = language === 'en' ? 'en-GB' : 'id-ID';
    return new Date(`${value}T00:00:00`).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const padAreaIndex = (index) => String(index + 1).padStart(2, '0');

const buildCatalog = (session) => {
    const timeSeries = buildTimeSeries(session?.startDate);
    const imageryGroups = SATELLITE_META.map((sat) => ({
        id: sat.id,
        sensor: sat.sensor,
        typeKey: sat.typeKey,
        platform: sat.platform,
        resolution: sat.resolution,
        color: sat.color,
        items: timeSeries
            .filter((item) => item.satelliteId === sat.id)
            .map((item) => ({
                id: item.id,
                sensor: item.sensor,
                date: item.date,
                typeKey: item.typeKey,
                platform: item.platform,
                resolution: item.resolution,
                selectable: true,
            })),
    })).filter((group) => group.items.length > 0);

    const analysisGroups = ANALYSIS_AREAS.map((area, index) => ({
        id: area.id,
        nameKey: area.nameKey,
        kind: area.kind || 'area',
        index,
        items: area.products.map((product) => ({
            id: product.id,
            nameKey: product.nameKey,
            status: product.status,
            completedAt: product.completedAt,
            selectable: product.status === 'completed',
        })),
    })).filter((group) => group.items.length > 0);

    return { imageryGroups, analysisGroups };
};

const Publish = ({ isOpen, onClose }) => {
    const { t, currentLanguage } = useTranslation();
    const session = useMemo(() => (isOpen ? ensureLiveSession() : null), [isOpen]);
    const activationKey = session?.id || session?.title || '';
    const catalog = useMemo(
        () => (isOpen ? buildCatalog(session) : { imageryGroups: [], analysisGroups: [] }),
        [isOpen, session]
    );
    const imageryItems = useMemo(
        () => catalog.imageryGroups.flatMap((group) => group.items),
        [catalog]
    );
    const analysisItems = useMemo(
        () => catalog.analysisGroups.flatMap((group) => group.items),
        [catalog]
    );
    const selectableAnalysisItems = useMemo(
        () => analysisItems.filter((item) => item.selectable),
        [analysisItems]
    );
    const allItemIds = useMemo(
        () => [...imageryItems.map((item) => item.id), ...selectableAnalysisItems.map((item) => item.id)],
        [imageryItems, selectableAnalysisItems]
    );

    const [publishedIds, setPublishedIds] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const selectedImageryItems = imageryItems.filter((item) => selectedIds.includes(item.id));
    const selectedAnalysisItems = selectableAnalysisItems.filter((item) => selectedIds.includes(item.id));
    const selectedImagery = selectedImageryItems.length;
    const selectedAnalysis = selectedAnalysisItems.length;
    const canPublish = selectedImagery + selectedAnalysis > 0;
    const categoryLabel = session?.category ? t(`activation.categories.${session.category}`) : '';
    const activationTitle = session?.title?.trim() || t('publish.untitledActivation');

    const imageryLabel = (item) => `${item.sensor} · ${formatDate(item.date, currentLanguage)}`;
    const analysisLabel = (item, group) =>
        `${group.kind === 'source' ? t(group.nameKey) : `${padAreaIndex(group.index)} ${t(group.nameKey)}`} · ${t(item.nameKey)}`;

    useEffect(() => {
        if (!isOpen) return;

        const saved = loadPublishedIds(activationKey).filter((id) => allItemIds.includes(id));
        setPublishedIds(saved);
        setSelectedIds(saved);
        setFeedback(null);
        setIsConfirmOpen(false);
    }, [isOpen, activationKey, allItemIds]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleEscape = (event) => {
            if (event.key !== 'Escape') return;
            if (isConfirmOpen) {
                setIsConfirmOpen(false);
                return;
            }
            onClose();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, isConfirmOpen, onClose]);

    if (!isOpen) return null;

    const toggleItem = (id, selectable = true) => {
        if (!selectable) return;
        setFeedback(null);
        setSelectedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    };

    const setGroupSelected = (items, checked) => {
        const ids = items.filter((item) => item.selectable !== false).map((item) => item.id);
        setFeedback(null);
        setSelectedIds((current) => {
            const withoutGroup = current.filter((id) => !ids.includes(id));
            return checked ? [...withoutGroup, ...ids] : withoutGroup;
        });
    };

    const openConfirm = () => {
        if (!canPublish) {
            setFeedback({ type: 'error', message: t('publish.empty') });
            return;
        }
        setIsConfirmOpen(true);
    };

    const confirmPublish = () => {
        const nextPublished = savePublishedIds(
            activationKey,
            selectedIds.filter((id) => allItemIds.includes(id))
        );
        setPublishedIds(nextPublished);
        setIsConfirmOpen(false);
        setFeedback({
            type: 'success',
            message: t('publish.success')
                .replace('{imagery}', String(selectedImagery))
                .replace('{analysis}', String(selectedAnalysis)),
        });
    };

    const renderGroupedList = (groups, groupKey, kind) => {
        const selectableItems = groups.flatMap((group) =>
            group.items.filter((item) => item.selectable !== false)
        );
        const allSelected =
            selectableItems.length > 0 && selectableItems.every((item) => selectedIds.includes(item.id));

        return (
            <section className="publish-group">
                <header className="publish-group-header">
                    <div>
                        <h3>{t(`publish.${groupKey}Title`)}</h3>
                        <p>{t(`publish.${groupKey}Hint`)}</p>
                    </div>
                    {selectableItems.length > 0 ? (
                        <button
                            type="button"
                            className="publish-text-btn"
                            onClick={() => setGroupSelected(selectableItems, !allSelected)}
                        >
                            {allSelected ? t('publish.clear') : t('publish.selectAll')}
                        </button>
                    ) : null}
                </header>

                {groups.length > 0 ? (
                    <div className="publish-tree">
                        {groups.map((group) => (
                            <section key={group.id} className="publish-subgroup">
                                <h4 className="publish-subgroup-title">
                                    {kind === 'imagery' ? (
                                        <>
                                            <span
                                                className="publish-sat-dot"
                                                style={{ background: group.color }}
                                            />
                                            <span>
                                                {group.sensor}
                                                <small>
                                                    {t(group.typeKey)} · {group.resolution} · {group.platform}
                                                </small>
                                            </span>
                                        </>
                                    ) : (
                                        <span>
                                            {group.kind === 'source'
                                                ? t(group.nameKey)
                                                : `${padAreaIndex(group.index)} ${t(group.nameKey)}`}
                                        </span>
                                    )}
                                </h4>
                                <ul className="publish-list">
                                    {group.items.map((item) => {
                                        const checked = selectedIds.includes(item.id);
                                        const isPublished = publishedIds.includes(item.id);
                                        const disabled = item.selectable === false;

                                        return (
                                            <li key={item.id}>
                                                <label
                                                    className={`publish-item${checked ? ' is-checked' : ''}${
                                                        disabled ? ' is-disabled' : ''
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        disabled={disabled}
                                                        onChange={() => toggleItem(item.id, item.selectable)}
                                                    />
                                                    <span className="publish-item-copy">
                                                        {kind === 'imagery' ? (
                                                            <>
                                                                <strong>{formatDate(item.date, currentLanguage)}</strong>
                                                                <span>
                                                                    {item.sensor} · {t(item.typeKey)} · {item.resolution} · {item.platform}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <strong>{t(item.nameKey)}</strong>
                                                                <span>
                                                                    {item.status === 'completed' && item.completedAt
                                                                        ? t('mapDashboard.completed').replace(
                                                                              '{time}',
                                                                              item.completedAt
                                                                          )
                                                                        : t('mapDashboard.notProduced')}
                                                                </span>
                                                            </>
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`publish-chip${
                                                            isPublished ? ' is-live' : disabled ? ' is-missing' : ''
                                                        }`}
                                                    >
                                                        {disabled
                                                            ? t('publish.statusUnavailable')
                                                            : isPublished
                                                              ? t('publish.statusPublished')
                                                              : t('publish.statusDraft')}
                                                    </span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        ))}
                    </div>
                ) : (
                    <p className="publish-empty">{t('publish.groupEmpty')}</p>
                )}
            </section>
        );
    };

    return (
        <div className="publish-overlay" onClick={onClose}>
            <div
                className="publish-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="publish-dialog-title"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="publish-dialog-header">
                    <div>
                        <p className="publish-eyebrow">{t('publish.eyebrow')}</p>
                        <h2 id="publish-dialog-title">{t('publish.title')}</h2>
                        <p>{t('publish.subtitle')}</p>
                    </div>
                    <button type="button" className="publish-text-btn" onClick={onClose}>
                        {t('publish.back')}
                    </button>
                </header>

                <section className="publish-session" aria-label={t('publish.activationLabel')}>
                    <p className="publish-eyebrow">{t('publish.activationLabel')}</p>
                    <h3>{activationTitle}</h3>
                    <p>
                        {[categoryLabel, session?.startDate ? formatDate(session.startDate, currentLanguage) : null]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                </section>

                <div className="publish-grid">
                    {renderGroupedList(catalog.imageryGroups, 'imagery', 'imagery')}
                    {renderGroupedList(catalog.analysisGroups, 'analysis', 'analysis')}
                </div>

                {feedback ? (
                    <p className={`publish-feedback is-${feedback.type}`} role="status">
                        {feedback.message}
                    </p>
                ) : null}

                <div className="publish-footer">
                    <p>
                        {t('publish.itemsSelected')
                            .replace('{imagery}', String(selectedImagery))
                            .replace('{analysis}', String(selectedAnalysis))}
                    </p>
                    <button type="button" className="publish-submit" onClick={openConfirm} disabled={!canPublish}>
                        {t('publish.submit')}
                    </button>
                </div>
            </div>

            {isConfirmOpen ? (
                <div className="publish-overlay publish-overlay--nested" onClick={() => setIsConfirmOpen(false)}>
                    <div
                        className="publish-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="publish-confirm-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="publish-confirm-title">{t('publish.confirmTitle')}</h2>
                        <p>
                            {t('publish.confirmBody')
                                .replace('{imagery}', String(selectedImagery))
                                .replace('{analysis}', String(selectedAnalysis))
                                .replace('{title}', activationTitle)}
                        </p>
                        <ul className="publish-confirm-list">
                            {catalog.imageryGroups.flatMap((group) =>
                                group.items
                                    .filter((item) => selectedIds.includes(item.id))
                                    .map((item) => <li key={item.id}>{imageryLabel(item)}</li>)
                            )}
                            {catalog.analysisGroups.flatMap((group) =>
                                group.items
                                    .filter((item) => selectedIds.includes(item.id))
                                    .map((item) => <li key={item.id}>{analysisLabel(item, group)}</li>)
                            )}
                        </ul>
                        <div className="publish-modal-actions">
                            <button type="button" className="publish-text-btn" onClick={() => setIsConfirmOpen(false)}>
                                {t('publish.confirmCancel')}
                            </button>
                            <button type="button" className="publish-submit" onClick={confirmPublish}>
                                {t('publish.confirmSubmit')}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Publish;
