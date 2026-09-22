import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCollectionsAsync,
  searchItemsAsync,
  setSelectedCollections,
  clearSearch,
} from '../redux/slices/stacCatalog';
import { useTranslation } from '../utils/i18n';
import Skeleton from './Skeleton';
import { normalizeBbox } from '../services/stac.service';
import './StacCatalog.scss';

const formatXYZUrl = (assetHref) => {
  let xyzUrl = assetHref;
  if (xyzUrl.startsWith('http://') && window.location.protocol === 'https:') {
    xyzUrl = xyzUrl.replace('http://', 'https://');
  }
  if (!xyzUrl.includes('{z}')) {
    xyzUrl = xyzUrl.endsWith('/') ? xyzUrl : `${xyzUrl}/`;
    xyzUrl = `${xyzUrl}{z}/{x}/{y}.png`;
  }
  return xyzUrl;
};

const getTileAssets = (item) =>
  Object.keys(item.assets || {}).filter((key) => {
    const roles = item.assets[key]?.roles || [];
    return roles.includes('tiles') || roles.includes('data');
  });

const FootprintIcon = ({ visible }) => (
  <svg
    className="stac-footprint-icon"
    viewBox="0 0 16 16"
    width="15"
    height="15"
    aria-hidden="true"
  >
    {visible ? (
      <rect
        x="2.5"
        y="3.5"
        width="11"
        height="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.5 1.5"
      />
    ) : (
      <>
        <rect
          x="2.5"
          y="3.5"
          width="11"
          height="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.45"
        />
        <line x1="3" y1="4" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" />
      </>
    )}
  </svg>
);

const StacCatalogPanel = ({
  isOpen,
  onClose,
  selectedItem,
  selectedLabel,
  onItemSelect,
  onClearSelection,
  hiddenExtentIds,
  onToggleItemExtent,
  onResetView,
  mapBbox,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { collections, items, loading, error } = useSelector(
    (state) => state.stacCatalog
  );

  const [selectedCollections, setSelectedCollectionsLocal] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [expandedGisId, setExpandedGisId] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [previewThumb, setPreviewThumb] = useState(null);

  const itemRefs = useRef({});
  const searchDebounceRef = useRef(null);

  const buildSearchParams = useCallback(() => {
    const params = {};
    const bbox = normalizeBbox(mapBbox);
    if (bbox) {
      params.bbox = bbox;
    }
    if (selectedCollections.length > 0) {
      params.collections = selectedCollections;
    }
    if (startDate) params.startDate = new Date(startDate);
    if (endDate) params.endDate = new Date(endDate);
    return params;
  }, [mapBbox, selectedCollections, startDate, endDate]);

  const hasInvalidDateRange =
    Boolean(startDate && endDate && new Date(startDate) > new Date(endDate));

  const getErrorMessage = (err) => {
    if (!err) return null;
    if (err === 'INVALID_DATE_RANGE') return t('stacCatalog.invalidDateRange');
    return err;
  };

  const displayError = hasInvalidDateRange
    ? t('stacCatalog.invalidDateRange')
    : getErrorMessage(error);

  useEffect(() => {
    dispatch(fetchCollectionsAsync());
  }, [dispatch]);

  // Search within current map extent when panel is open
  useEffect(() => {
    if (!isOpen || !mapBbox || collections.length === 0 || hasInvalidDateRange) return;

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      dispatch(searchItemsAsync(buildSearchParams()));
    }, 400);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [isOpen, mapBbox, collections.length, buildSearchParams, dispatch, hasInvalidDateRange]);

  // Clear selection if item is no longer in current extent results
  useEffect(() => {
    if (!selectedItem) return;
    const stillVisible = items.some((item) => item.id === selectedItem.id);
    if (!stillVisible) {
      onClearSelection?.();
    }
  }, [items, selectedItem, onClearSelection]);

  const handleCollectionChange = (collectionId, checked) => {
    const updated = checked
      ? [...selectedCollections, collectionId]
      : selectedCollections.filter((id) => id !== collectionId);
    setSelectedCollectionsLocal(updated);
    dispatch(setSelectedCollections(updated));
  };

  const handleSearch = () => {
    if (!mapBbox || hasInvalidDateRange) return;
    onClearSelection?.();
    setExpandedGisId(null);
    dispatch(searchItemsAsync(buildSearchParams()));
    setFiltersExpanded(false);
  };

  const handleClear = () => {
    dispatch(clearSearch());
    setSelectedCollectionsLocal([]);
    setStartDate('');
    setEndDate('');
    onClearSelection?.();
    setExpandedGisId(null);
    onResetView?.();
    if (mapBbox) {
      const bbox = normalizeBbox(mapBbox);
      if (bbox) {
        dispatch(searchItemsAsync({ bbox }));
      }
    }
  };

  const handleItemClick = useCallback(
    (item) => {
      onItemSelect?.(item);
      if (itemRefs.current[item.id]) {
        setTimeout(() => {
          itemRefs.current[item.id]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 100);
      }
    },
    [onItemSelect]
  );

  const handleCopyXYZ = async (e, assetHref, itemId) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(formatXYZUrl(assetHref));
      setCopyFeedback(itemId);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openThumbPreview = (e, url, title) => {
    e.stopPropagation();
    if (!url) return;
    setPreviewThumb({ url, title });
  };

  useEffect(() => {
    if (!previewThumb) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setPreviewThumb(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewThumb]);

  if (!isOpen) return null;

  return (
    <div className="stac-panel-overlay">
      <div className="stac-panel">
        <div className="stac-panel-header">
          <div>
            <h2>{t('stacCatalog.panelTitle')}</h2>
            <p>{t('stacCatalog.panelHint')}</p>
          </div>
          <button
            type="button"
            className="stac-icon-btn"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        <div className="stac-panel-toolbar">
          <button
            type="button"
            className={`stac-btn stac-btn-ghost stac-btn-small ${filtersExpanded ? 'active' : ''}`}
            onClick={() => setFiltersExpanded((v) => !v)}
          >
            {t('stacCatalog.filters')}
          </button>
        </div>

        {filtersExpanded && (
          <div className="stac-panel-filters">
            <section className="stac-filter-section">
              <div className="stac-section-title-row">
                <h3>{t('stacCatalog.collections')}</h3>
                <div className="stac-mini-actions">
                  <button
                    type="button"
                    onClick={() => {
                      const all = collections.map((c) => c.id);
                      setSelectedCollectionsLocal(all);
                      dispatch(setSelectedCollections(all));
                    }}
                    disabled={!collections.length}
                  >
                    {t('stacCatalog.selectAll')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCollectionsLocal([]);
                      dispatch(setSelectedCollections([]));
                    }}
                    disabled={!selectedCollections.length}
                  >
                    {t('stacCatalog.clearSelection')}
                  </button>
                </div>
              </div>
              <p className="stac-hint">{t('stacCatalog.collectionsHint')}</p>
              <div className="stac-collections">
                {loading && collections.length === 0 ? (
                  <Skeleton variant="text" width="100%" height={20} count={3} />
                ) : (
                  collections.map((collection) => (
                    <label key={collection.id} className="stac-check">
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(collection.id)}
                        onChange={(e) =>
                          handleCollectionChange(collection.id, e.target.checked)
                        }
                      />
                      <span>{collection.title || collection.id}</span>
                    </label>
                  ))
                )}
              </div>
            </section>

            <section className="stac-filter-section">
              <h3>{t('stacCatalog.dateRange')}</h3>
              <div className="stac-dates">
                <label>
                  <span>{t('stacCatalog.from')}</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </label>
                <label>
                  <span>{t('stacCatalog.to')}</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </label>
              </div>
            </section>

            <div className="stac-filter-actions">
              <button
                type="button"
                className="stac-btn stac-btn-primary"
                onClick={handleSearch}
                disabled={loading || !mapBbox || hasInvalidDateRange}
              >
                {loading ? t('stacCatalog.searching') : t('stacCatalog.search')}
              </button>
              <button type="button" className="stac-btn stac-btn-ghost" onClick={handleClear}>
                {t('stacCatalog.reset')}
              </button>
            </div>

            {displayError && (
              <div className="stac-error" role="alert">
                {displayError}
              </div>
            )}
          </div>
        )}

        <div className="stac-panel-results">
          <div className="stac-results-heading">
            <h3>
              {t('stacCatalog.results')}{' '}
              <span className="stac-count">{items.length}</span>
            </h3>
            <p>{t('stacCatalog.resultsHint')}</p>
          </div>

          {selectedLabel && (
            <div className="stac-panel-status">
              <div className="stac-status-chip selected">
                <span className="stac-status-label">{t('stacCatalog.viewing')}</span>
                <strong title={selectedLabel}>{selectedLabel}</strong>
                <button
                  type="button"
                  className="stac-status-clear"
                  onClick={onClearSelection}
                >
                  {t('stacCatalog.clearView')}
                </button>
              </div>
            </div>
          )}

          {!mapBbox ? (
            <div className="stac-empty">
              <p>{t('stacCatalog.waitingExtent')}</p>
            </div>
          ) : loading ? (
            <div className="stac-results-loading">
              <Skeleton variant="rect" width="100%" height={72} count={3} />
            </div>
          ) : items.length === 0 ? (
            <div className="stac-empty">
              <p>{displayError ? t('stacCatalog.connectionError') : t('stacCatalog.noResultsInExtent')}</p>
            </div>
          ) : (
            <div className="stac-items">
              {items.map((item) => {
                const thumbnail =
                  item.assets?.thumbnail?.href || item.assets?.visual?.href;
                const date =
                  item.properties?.datetime || item.properties?.created || null;
                const isSelected = selectedItem?.id === item.id;
                const isExtentVisible = !hiddenExtentIds?.has(item.id);
                const tileKeys = getTileAssets(item);
                const title = item.properties?.title || item.id;

                return (
                  <article
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[item.id] = el;
                    }}
                    className={`stac-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    {thumbnail ? (
                      <div
                        className="stac-item-thumb is-clickable"
                        role="button"
                        tabIndex={0}
                        title={t('stacCatalog.previewThumb')}
                        onClick={(e) => openThumbPreview(e, thumbnail, title)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            openThumbPreview(e, thumbnail, title);
                          }
                        }}
                      >
                        <img src={thumbnail} alt="" loading="lazy" />
                      </div>
                    ) : (
                      <div className="stac-item-thumb placeholder">
                        <span>{t('stacCatalog.noPreview')}</span>
                      </div>
                    )}
                    <div className="stac-item-body">
                      <h4 title={title}>{title}</h4>
                      <div className="stac-item-meta">
                        {date && (
                          <span>
                            {new Date(date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                        {item.collection && (
                          <span className="stac-badge">{item.collection}</span>
                        )}
                      </div>
                      {isSelected && (
                        <p className="stac-item-active">{t('stacCatalog.showingOnMap')}</p>
                      )}
                      <button
                        type="button"
                        className={`stac-footprint-toggle ${isExtentVisible ? 'is-on' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleItemExtent?.(item.id);
                        }}
                        aria-pressed={isExtentVisible}
                        aria-label={
                          isExtentVisible
                            ? t('stacCatalog.hideFootprint')
                            : t('stacCatalog.showFootprint')
                        }
                        title={
                          isExtentVisible
                            ? t('stacCatalog.hideFootprint')
                            : t('stacCatalog.showFootprint')
                        }
                      >
                        <FootprintIcon visible={isExtentVisible} />
                      </button>
                      {tileKeys.length > 0 && (
                        <div className="stac-gis">
                          <button
                            type="button"
                            className="stac-gis-toggle"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedGisId(expandedGisId === item.id ? null : item.id);
                            }}
                          >
                            {expandedGisId === item.id
                              ? t('stacCatalog.hideGis')
                              : t('stacCatalog.showGis')}
                          </button>
                          {expandedGisId === item.id && (
                            <div className="stac-gis-panel" onClick={(e) => e.stopPropagation()}>
                              {tileKeys.map((key) => {
                                const href = item.assets[key].href;
                                const xyz = formatXYZUrl(href);
                                return (
                                  <div key={key} className="stac-gis-row">
                                    <code title={xyz}>{xyz}</code>
                                    <button
                                      type="button"
                                      className="stac-btn stac-btn-small"
                                      onClick={(e) =>
                                        handleCopyXYZ(e, href, `${item.id}-${key}`)
                                      }
                                    >
                                      {copyFeedback === `${item.id}-${key}`
                                        ? t('stacCatalog.copied')
                                        : t('stacCatalog.copyXyz')}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {previewThumb && (
        <div
          className="stac-thumb-preview-overlay"
          onClick={() => setPreviewThumb(null)}
          role="presentation"
        >
          <div
            className="stac-thumb-preview"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={previewThumb.title}
          >
            <button
              type="button"
              className="stac-thumb-preview-close"
              onClick={() => setPreviewThumb(null)}
              aria-label={t('common.close')}
            >
              ×
            </button>
            <h3>{previewThumb.title}</h3>
            <img src={previewThumb.url} alt={previewThumb.title} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StacCatalogPanel;
