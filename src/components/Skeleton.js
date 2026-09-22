import React from 'react';
import './Skeleton.scss';

/**
 * Skeleton Component for loading states
 * @param {string} variant - 'text', 'card', 'circle', 'rect'
 * @param {number} width - Width of skeleton
 * @param {number} height - Height of skeleton
 * @param {number} count - Number of skeleton items
 * @param {string} className - Additional CSS classes
 */
const Skeleton = ({ 
  variant = 'text', 
  width, 
  height, 
  count = 1, 
  className = '',
  ...props 
}) => {
  const baseClass = `skeleton skeleton-${variant}`;
  const style = {};
  
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (count === 1) {
    return (
      <span 
        className={`${baseClass} ${className}`.trim()} 
        style={style}
        {...props}
      />
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={`${baseClass} ${className}`.trim()}
          style={style}
          {...props}
        />
      ))}
    </>
  );
};

/**
 * Skeleton Card Component for product/map cards
 */
export const SkeletonCard = ({ count = 1, className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`skeleton-card ${className}`.trim()}>
          <Skeleton variant="rect" height={200} className="skeleton-card-image" />
          <div className="skeleton-card-content">
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="rect" width="100%" height={36} className="skeleton-card-button" />
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton Map Card Component
 */
export const SkeletonMapCard = ({ count = 1, className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`skeleton-map-card ${className}`.trim()}>
          <div className="skeleton-map-card-header">
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="rect" width={60} height={24} />
          </div>
          <div className="skeleton-map-card-info">
            <Skeleton variant="text" width="50%" height={16} />
            <Skeleton variant="text" width="60%" height={16} />
          </div>
          <Skeleton variant="rect" width="100%" height={40} className="skeleton-map-card-button" />
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton Grid Component
 */
export const SkeletonGrid = ({ 
  count = 3, 
  CardComponent = SkeletonCard,
  className = '',
  ...cardProps 
}) => {
  return (
    <div className={`skeleton-grid ${className}`.trim()}>
      <CardComponent count={count} {...cardProps} />
    </div>
  );
};

export default Skeleton;

