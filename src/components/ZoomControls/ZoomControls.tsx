'use client';

import React, { memo } from 'react';
import { Viewport } from '../../types';
import styles from './ZoomControls.module.css';

interface Props {
  viewport: Viewport;
  isDark: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

const ZoomControls = memo(function ZoomControls({ viewport, isDark, onZoomIn, onZoomOut, onResetZoom }: Props) {
  return (
    <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`}>
      <button onClick={onZoomOut} className={styles.btn} title="Zoom out (Ctrl+-)">−</button>
      <span className={styles.label} onClick={onResetZoom} title="Reset zoom (Ctrl+0)">
        {Math.round(viewport.zoom * 100)}%
      </span>
      <button onClick={onZoomIn} className={styles.btn} title="Zoom in (Ctrl++)">+</button>
    </div>
  );
});

export default ZoomControls;
