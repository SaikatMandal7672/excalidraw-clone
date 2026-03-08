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

function Swatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={color}
      className={`w-5 h-5 rounded cursor-pointer p-0 shrink-0 ${selected ? 'ring-2 ring-blue-500' : 'border border-gray-300 dark:border-zinc-600'}`}
      style={{
        background: color === 'transparent'
          ? 'repeating-linear-gradient(45deg,#d1d5db 0,#d1d5db 2px,#fff 0,#fff 50%) 0 0 / 6px 6px'
          : color,
      }}
    />
  );
}

function SliderRow({ label, value, min, max, step, onChange, format }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-[11px] text-gray-700 dark:text-gray-200">{format ? format(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-500 h-1 cursor-pointer" />
    </div>
  );
}

const PropertiesPanel = memo(function PropertiesPanel({ selectedElements, properties, onPropertyChange, theme }: Props) {
  const isDark = theme === 'dark';
  const hasText = selectedElements.some((el) => el.type === 'text');

  return (
    <div className={`w-[220px] overflow-y-auto flex flex-col text-[13px] select-none border-l ${isDark ? 'bg-zinc-900 border-zinc-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`}>
      <div className={`p-3 text-xs font-semibold border-b ${isDark ? 'border-zinc-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
        {selectedElements.length > 0
          ? `${selectedElements.length} element${selectedElements.length > 1 ? 's' : ''} selected`
          : 'Drawing Properties'}
      </div>

      {/* Stroke Color */}
      <div className="px-3 pt-3">
        <span className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stroke</span>
        <div className="flex flex-wrap gap-1 mb-2">
          {STROKE_COLORS.map((c) => (
            <Swatch key={c} color={c} selected={properties.strokeColor === c}
              onClick={() => onPropertyChange({ strokeColor: c })} />
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <input type="color" value={properties.strokeColor} onChange={(e) => onPropertyChange({ strokeColor: e.target.value })}
            className="w-7 h-7 border-none rounded cursor-pointer p-0 bg-transparent" />
          <input type="text" value={properties.strokeColor} onChange={(e) => onPropertyChange({ strokeColor: e.target.value })}
            className={`flex-1 rounded px-1.5 py-0.5 text-xs font-mono border ${isDark ? 'bg-zinc-800 border-zinc-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`} />
        </div>
      </div>

      {/* Fill Color */}
      <div className="px-3 pt-3">
        <span className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fill</span>
        <div className="flex flex-wrap gap-1 mb-2">
          {FILL_COLORS.map((c) => (
            <Swatch key={c} color={c} selected={properties.fillColor === c}
              onClick={() => onPropertyChange({ fillColor: c })} />
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <input type="color" value={properties.fillColor === 'transparent' ? '#ffffff' : properties.fillColor}
            onChange={(e) => onPropertyChange({ fillColor: e.target.value })}
            className="w-7 h-7 border-none rounded cursor-pointer p-0 bg-transparent" />
          <input type="text" value={properties.fillColor} onChange={(e) => onPropertyChange({ fillColor: e.target.value })}
            className={`flex-1 rounded px-1.5 py-0.5 text-xs font-mono border ${isDark ? 'bg-zinc-800 border-zinc-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`} />
        </div>
      </div>

      {/* Stroke Width */}
      <div className="px-3 pt-3">
        <SliderRow label="Stroke Width" value={properties.strokeWidth} min={0.5} max={20} step={0.5}
          onChange={(v) => onPropertyChange({ strokeWidth: v })} />
      </div>

      {/* Stroke Style */}
      <div className="px-3 pt-3">
        <span className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stroke Style</span>
        <div className="flex gap-1 mb-2">
          {(['solid', 'dashed', 'dotted'] as const).map((s) => (
            <button key={s} onClick={() => onPropertyChange({ strokeStyle: s })} title={s}
              className={`flex-1 h-7 rounded text-[11px] font-medium cursor-pointer border ${
                properties.strokeStyle === s
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-500'
                  : isDark ? 'border-zinc-700 bg-zinc-800 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}>
              {s === 'solid' ? '—' : s === 'dashed' ? '- -' : '···'}
            </button>
          ))}
        </div>
      </div>

      {/* Roughness */}
      <div className="px-3 pt-3">
        <SliderRow label="Roughness" value={properties.roughness} min={0} max={4} step={0.5}
          onChange={(v) => onPropertyChange({ roughness: v })} format={(v) => v.toString()} />
      </div>

      {/* Opacity */}
      <div className="px-3 pt-3">
        <SliderRow label="Opacity" value={properties.opacity} min={0} max={100} step={1}
          onChange={(v) => onPropertyChange({ opacity: v })} format={(v) => `${v}%`} />
      </div>

      {hasText && (
        <>
          <div className="px-3 pt-3">
            <SliderRow label="Font Size" value={properties.fontSize} min={8} max={120} step={1}
              onChange={(v) => onPropertyChange({ fontSize: v })} format={(v) => `${v}px`} />
          </div>
          <div className="px-3 pt-3">
            <span className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Font</span>
            <select value={properties.fontFamily} onChange={(e) => onPropertyChange({ fontFamily: e.target.value })}
              className={`w-full rounded px-1.5 py-1 text-xs mb-2 border ${isDark ? 'bg-zinc-800 border-zinc-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
              <option value="Caveat, cursive">Caveat (Handwritten)</option>
              <option value="sans-serif">Sans-serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
});

export default PropertiesPanel;
