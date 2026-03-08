'use client';

import React, { memo } from 'react';
import { DrawingProperties, ExcalidrawElement } from '../types';
import { STROKE_COLORS, FILL_COLORS } from '../lib/constants';

interface Props {
  selectedElements: ExcalidrawElement[];
  properties: DrawingProperties;
  onPropertyChange: (updates: Partial<DrawingProperties>) => void;
  theme: 'light' | 'dark';
}

function Swatch({
  color, selected, borderColor, onClick,
}: {
  color: string; selected: boolean; borderColor: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={color}
      style={{
        width: 20, height: 20, borderRadius: 4,
        border: selected ? '2px solid #1a73e8' : `1px solid ${borderColor}`,
        background: color === 'transparent'
          ? 'repeating-linear-gradient(45deg,#d1d5db 0,#d1d5db 2px,#fff 0,#fff 50%) 0 0 / 6px 6px'
          : color,
        cursor: 'pointer', padding: 0, flexShrink: 0,
      }}
    />
  );
}

function SliderRow({
  label, value, min, max, step, onChange, format, labelColor, textColor,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string;
  labelColor: string; textColor: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: labelColor }}>{label}</span>
        <span style={{ fontSize: 11, color: textColor }}>{format ? format(value) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#6366f1' }}
      />
    </div>
  );
}

const PropertiesPanel = memo(function PropertiesPanel({
  selectedElements, properties, onPropertyChange, theme,
}: Props) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1e1e1e' : '#ffffff';
  const border = isDark ? '#333' : '#e5e7eb';
  const text = isDark ? '#e5e7eb' : '#374151';
  const label = isDark ? '#9ca3af' : '#6b7280';
  const inputBg = isDark ? '#2a2a2a' : '#f9fafb';

  const hasText = selectedElements.some((el) => el.type === 'text');

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: label,
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block',
  };

  return (
    <div style={{
      width: 220, background: bg, borderLeft: `1px solid ${border}`,
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
      color: text, fontSize: 13, userSelect: 'none',
    }}>
      <div style={{ padding: 12, borderBottom: `1px solid ${border}`, fontSize: 12, fontWeight: 600, color: label }}>
        {selectedElements.length > 0
          ? `${selectedElements.length} element${selectedElements.length > 1 ? 's' : ''} selected`
          : 'Drawing Properties'}
      </div>

      {/* Stroke Color */}
      <Section>
        <span style={labelStyle}>Stroke</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {STROKE_COLORS.map((c) => (
            <Swatch key={c} color={c} selected={properties.strokeColor === c} borderColor={border}
              onClick={() => onPropertyChange({ strokeColor: c })} />
          ))}
        </div>
        <ColorInput value={properties.strokeColor} onChange={(v) => onPropertyChange({ strokeColor: v })}
          inputBg={inputBg} border={border} text={text} />
      </Section>

      {/* Fill Color */}
      <Section>
        <span style={labelStyle}>Fill</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {FILL_COLORS.map((c) => (
            <Swatch key={c} color={c} selected={properties.fillColor === c} borderColor={border}
              onClick={() => onPropertyChange({ fillColor: c })} />
          ))}
        </div>
        <ColorInput
          value={properties.fillColor === 'transparent' ? '#ffffff' : properties.fillColor}
          displayValue={properties.fillColor}
          onChange={(v) => onPropertyChange({ fillColor: v })}
          inputBg={inputBg} border={border} text={text}
        />
      </Section>

      {/* Stroke Width */}
      <Section>
        <SliderRow label="Stroke Width" value={properties.strokeWidth} min={0.5} max={20} step={0.5}
          onChange={(v) => onPropertyChange({ strokeWidth: v })} labelColor={label} textColor={text} />
      </Section>

      {/* Stroke Style */}
      <Section>
        <span style={labelStyle}>Stroke Style</span>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {(['solid', 'dashed', 'dotted'] as const).map((s) => (
            <button key={s} onClick={() => onPropertyChange({ strokeStyle: s })} title={s}
              style={{
                flex: 1, height: 28, borderRadius: 4,
                border: `1px solid ${properties.strokeStyle === s ? '#6366f1' : border}`,
                background: properties.strokeStyle === s ? '#ede9fe' : inputBg,
                color: properties.strokeStyle === s ? '#6366f1' : text,
                cursor: 'pointer', fontSize: 11, fontWeight: 500,
              }}>
              {s === 'solid' ? '—' : s === 'dashed' ? '- -' : '···'}
            </button>
          ))}
        </div>
      </Section>

      {/* Roughness */}
      <Section>
        <SliderRow label="Roughness" value={properties.roughness} min={0} max={4} step={0.5}
          onChange={(v) => onPropertyChange({ roughness: v })} format={(v) => v.toString()}
          labelColor={label} textColor={text} />
      </Section>

      {/* Opacity */}
      <Section>
        <SliderRow label="Opacity" value={properties.opacity} min={0} max={100} step={1}
          onChange={(v) => onPropertyChange({ opacity: v })} format={(v) => `${v}%`}
          labelColor={label} textColor={text} />
      </Section>

      {hasText && (
        <>
          <Section>
            <SliderRow label="Font Size" value={properties.fontSize} min={8} max={120} step={1}
              onChange={(v) => onPropertyChange({ fontSize: v })} format={(v) => `${v}px`}
              labelColor={label} textColor={text} />
          </Section>
          <Section>
            <span style={labelStyle}>Font</span>
            <select value={properties.fontFamily} onChange={(e) => onPropertyChange({ fontFamily: e.target.value })}
              style={{
                width: '100%', background: inputBg, border: `1px solid ${border}`,
                borderRadius: 4, padding: '4px 6px', color: text, fontSize: 12, marginBottom: 8,
              }}>
              <option value="Caveat, cursive">Caveat (Handwritten)</option>
              <option value="sans-serif">Sans-serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
            </select>
          </Section>
        </>
      )}
    </div>
  );
});

function Section({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '12px 12px 0' }}>{children}</div>;
}

function ColorInput({
  value, displayValue, onChange, inputBg, border, text,
}: {
  value: string; displayValue?: string; onChange: (v: string) => void;
  inputBg: string; border: string; text: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0, background: 'none' }} />
      <input type="text" value={displayValue ?? value} onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1, background: inputBg, border: `1px solid ${border}`, borderRadius: 4,
          padding: '3px 6px', color: text, fontSize: 12, fontFamily: 'monospace',
        }} />
    </div>
  );
}

export default PropertiesPanel;
