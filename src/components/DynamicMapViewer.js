import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMapsAsync } from '../redux/slices/dynamicMap';
import { fetchMaps } from '../services/map.service';
import { useTranslation } from '../utils/i18n';
import { SkeletonMapCard } from './Skeleton';
import DynamicMap from './DynamicMap';
import './DynamicMapViewer.scss';

const DynamicMapViewer = () => {
  const { mapId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { maps, loading } = useSelector((state) => state.dynamicMap);
  const [selectedMapId, setSelectedMapId] = useState(mapId || null);
  const [showMapList, setShowMapList] = useState(!mapId);

  useEffect(() => {
    if (showMapList) {
      dispatch(fetchMapsAsync());
    }
  }, [dispatch, showMapList]);

  useEffect(() => {
    if (mapId) {
      setSelectedMapId(mapId);
      setShowMapList(false);
    }
  }, [mapId]);

  const handleMapSelect = (id) => {
    setSelectedMapId(id);
    setShowMapList(false);
    navigate(`/dynamic-maps/${id}`);
  };

  const handleBackToList = () => {
    setSelectedMapId(null);
    setShowMapList(true);
    navigate('/dynamic-maps');
  };

  if (showMapList) {
    return (
      <div className="dynamic-map-viewer">
        <div className="map-list-container">
          <h1>{t('maps.title')}</h1>
          <p className="subtitle">{t('maps.selectMap')}</p>
          
          {loading ? (
            <div className="maps-grid">
              <SkeletonMapCard count={6} />
            </div>
          ) : (
            <div className="maps-grid">
              {maps && maps.length > 0 ? (
                maps.map((map) => (
                  <div
                    key={map.id}
                    className="map-card"
                    onClick={() => handleMapSelect(map.id)}
                  >
                    <div className="map-card-header">
                      <h3>{map.name}</h3>
                      {map.is_public && <span className="public-badge">Public</span>}
                    </div>
                    <div className="map-card-info">
                      <p>
                        <strong>{t('maps.zoom')}:</strong> {map.zoom}
                      </p>
                      {map.center && (
                        <p>
                          <strong>{t('maps.center')}:</strong>{' '}
                          {map.center.coordinates
                            ? `${map.center.coordinates[1].toFixed(4)}, ${map.center.coordinates[0].toFixed(4)}`
                            : `${map.center.lat?.toFixed(4)}, ${map.center.lng?.toFixed(4)}`}
                        </p>
                      )}
                    </div>
                    <button className="btn-view-map">{t('maps.viewMap')}</button>
                  </div>
                ))
              ) : (
                <div className="no-maps">
                  <p>{t('maps.noMapsAvailable')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dynamic-map-viewer">
      <div className="map-controls">
        <button onClick={handleBackToList} className="btn-back">
          ← {t('common.back')}
        </button>
      </div>
      <div className="map-container-wrapper">
        {selectedMapId && <DynamicMap mapId={selectedMapId} />}
      </div>
    </div>
  );
};

export default DynamicMapViewer;

