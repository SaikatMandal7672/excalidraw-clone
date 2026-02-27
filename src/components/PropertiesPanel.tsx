'use client';

import React from 'react';
import { DrawingProperties, ExcalidrawElement, TextElement } from '../types';
import { STROKE_COLORS, FILL_COLORS } from '../lib/constants';

interface PropertiesPanelProps {
  selectedElements: ExcalidrawElement[];
  properties: DrawingProperties;
  onPropertyChange: (updates: Partial<DrawingProperties>) => void;
  theme: 'light' | 'dark';
}

export default function PropertiesPanel({
  selectedElements,
  properties,
  onPropertyChange,
  theme,
}: PropertiesPanelProps) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1e1e1e' : '#ffffff';
  const border = isDark ? '#333' : '#e5e7eb';
  const text = isDark ? '#e5e7eb' : '#374151';
  const labelColor = isDark ? '#9ca3af' : '#6b7280';
  const inputBg = isDark ? '#2a2a2a' : '#f9fafb';

  const hasText = selectedElements.some((el) => el.type === 'text');

  const sectionStyle: React.CSSProperties = {
    padding: '12px 12px 0',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: labelColor,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
    display: 'block',
  };
  const swatchRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  };

  function Swatch({
    color,
    selected,
    onClick,
  }: {
    color: string;
    selected: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        title={color}
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          border: selected ? '2px solid #1a73e8' : `1px solid ${border}`,
          background:
            color === 'transparent'
              ? 'repeating-linear-gradient(45deg,#d1d5db 0,#d1d5db 2px,#fff 0,#fff 50%) 0 0 / 6px 6px'
              : color,
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
        }}
      />
    );
  }

  function SliderRow({
    label,
    value,
    min,
    max,
    step,
    onChange,
    format,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
    format?: (v: number) => string;
  }) {
    return (
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 11, color: labelColor }}>{label}</span>
          <span style={{ fontSize: 11, color: text }}>
            {format ? format(value) : value}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#6366f1' }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: 220,
        background: bg,
        borderLeft: `1px solid ${border}`,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        color: text,
        fontSize: 13,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          padding: '12px',
          borderBottom: `1px solid ${border}`,
          fontSize: 12,
          fontWeight: 600,
          color: labelColor,
        }}
      >
        {selectedElements.length > 0
          ? `${selectedElements.length} element${selectedElements.length > 1 ? 's' : ''} selected`
          : 'Drawing Properties'}
      </div>

      {/* Stroke Color */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Stroke</span>
        <div style={swatchRowStyle}>
          {STROKE_COLORS.map((c) => (
            <Swatch
              key={c}
              color={c}
              selected={properties.strokeColor === c}
              onClick={() => onPropertyChange({ strokeColor: c })}
            />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <input
            type="color"
            value={properties.strokeColor}
            onChange={(e) => onPropertyChange({ strokeColor: e.target.value })}
            style={{
              width: 28,
              height: 28,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              padding: 0,
              background: 'none',
            }}
          />
          <input
            type="text"
            value={properties.strokeColor}
            onChange={(e) => onPropertyChange({ strokeColor: e.target.value })}
            style={{
              flex: 1,
              background: inputBg,
              border: `1px solid ${border}`,
              borderRadius: 4,
              padding: '3px 6px',
              color: text,
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          />
        </div>
      </div>

      {/* Fill Color */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Fill</span>
        <div style={swatchRowStyle}>
          {FILL_COLORS.map((c) => (
            <Swatch
              key={c}
              color={c}
              selected={properties.fillColor === c}
              onClick={() => onPropertyChange({ fillColor: c })}
            />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <input
            type="color"
            value={
              properties.fillColor === 'transparent' ? '#ffffff' : properties.fillColor
            }
            onChange={(e) => onPropertyChange({ fillColor: e.target.value })}
            style={{
              width: 28,
              height: 28,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              padding: 0,
              background: 'none',
            }}
          />
          <input
            type="text"
            value={properties.fillColor}
            onChange={(e) => onPropertyChange({ fillColor: e.target.value })}
            style={{
              flex: 1,
              background: inputBg,
              border: `1px solid ${border}`,
              borderRadius: 4,
              padding: '3px 6px',
              color: text,
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          />
        </div>
      </div>

      {/* Stroke Width */}
      <div style={sectionStyle}>
        <SliderRow
          label="Stroke Width"
          value={properties.strokeWidth}
          min={0.5}
          max={20}
          step={0.5}
          onChange={(v) => onPropertyChange({ strokeWidth: v })}
        />
      </div>

      {/* Stroke Style */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Stroke Style</span>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {(['solid', 'dashed', 'dotted'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onPropertyChange({ strokeStyle: s })}
              title={s}
              style={{
                flex: 1,
                height: 28,
                borderRadius: 4,
                border: `1px solid ${properties.strokeStyle === s ? '#6366f1' : border}`,
                background: properties.strokeStyle === s ? '#ede9fe' : inputBg,
                color: properties.strokeStyle === s ? '#6366f1' : text,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {s === 'solid' ? '—' : s === 'dashed' ? '- -' : '···'}
            </button>
          ))}
        </div>
      </div>

      {/* Roughness */}
      <div style={sectionStyle}>
        <SliderRow
          label="Roughness"
          value={properties.roughness}
          min={0}
          max={4}
          step={0.5}
          onChange={(v) => onPropertyChange({ roughness: v })}
          format={(v) => v.toString()}
        />
      </div>

      {/* Opacity */}
      <div style={sectionStyle}>
        <SliderRow
          label="Opacity"
          value={properties.opacity}
          min={0}
          max={100}
          step={1}
          onChange={(v) => onPropertyChange({ opacity: v })}
          format={(v) => `${v}%`}
        />
      </div>

      {/* Font Size (text only) */}
      {hasText && (
        <div style={sectionStyle}>
          <SliderRow
            label="Font Size"
            value={properties.fontSize}
            min={8}
            max={120}
            step={1}
            onChange={(v) => onPropertyChange({ fontSize: v })}
            format={(v) => `${v}px`}
          />
        </div>
      )}

      {/* Font Family (text only) */}
      {hasText && (
        <div style={sectionStyle}>
          <span style={labelStyle}>Font</span>
          <select
            value={properties.fontFamily}
            onChange={(e) => onPropertyChange({ fontFamily: e.target.value })}
            style={{
              width: '100%',
              background: inputBg,
              border: `1px solid ${border}`,
              borderRadius: 4,
              padding: '4px 6px',
              color: text,
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            <option value="Caveat, cursive">Caveat (Handwritten)</option>
            <option value="sans-serif">Sans-serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>
      )}
    </div>
  );
}
