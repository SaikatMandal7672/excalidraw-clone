'use client';

import React, { memo } from 'react';
import { DrawingProperties, ExcalidrawElement } from '../types';
import { STROKE_COLORS, FILL_COLORS } from '../lib/constants';

interface Props {
  selectedElements: ExcalidrawElement[];
  properties: DrawingProperties;
  onPropertyChange: (updates: Partial<DrawingProperties>) => void;
  theme: 'light' | 'dark';
  open: boolean;
  onToggle: () => void;
}

function Swatch({ color, selected, onClick, isDark }: { color: string; selected: boolean; onClick: () => void; isDark: boolean }) {
  return (
    <button
      onClick={onClick}
      title={color}
      className={`w-[22px] h-[22px] rounded-md cursor-pointer p-0 shrink-0 transition-all duration-150
        ${selected
          ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110'
          : isDark
            ? 'border border-zinc-600 hover:scale-110'
            : 'border border-gray-200 hover:scale-110'
        }`}
      style={{
        background: color === 'transparent'
          ? `repeating-conic-gradient(${isDark ? '#444' : '#d1d5db'} 0% 25%, ${isDark ? '#333' : '#fff'} 0% 50%) 50% / 8px 8px`
          : color,
        ['--tw-ring-offset-color' as string]: isDark ? '#18181b' : '#fff',
      }}
    />
  );
}

function SliderRow({ label, value, min, max, step, onChange, format, isDark }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string; isDark: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>{label}</span>
        <span className={`text-[11px] font-semibold tabular-nums ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
          {format ? format(value) : value}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full" />
    </div>
  );
}

function Section({ label, isDark, children }: { label: string; isDark: boolean; children: React.ReactNode }) {
  return (
    <div className={`px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}>
      <div className={`text-[10px] font-semibold uppercase tracking-[0.08em] mb-2.5 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
        {label}
      </div>
      {children}
    </div>
  );
}

const PropertiesPanel = memo(function PropertiesPanel({ selectedElements, properties, onPropertyChange, theme, open, onToggle }: Props) {
  const isDark = theme === 'dark';
  const hasText = selectedElements.some((el) => el.type === 'text');

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={`absolute top-3 right-3 z-30 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer
          backdrop-blur-xl transition-all duration-200 border
          ${isDark
            ? 'bg-zinc-900/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/90 shadow-lg shadow-black/30'
            : 'bg-white/80 border-gray-200/70 text-gray-400 hover:text-gray-700 hover:bg-white/95 shadow-lg shadow-gray-200/50'
          }`}
        title="Toggle Properties"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {/* Panel */}
      <div className={`
        absolute top-14 right-3 z-20 w-[240px] rounded-2xl overflow-hidden
        backdrop-blur-xl shadow-xl select-none
        transition-all duration-200 origin-top-right
        ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
        ${isDark
          ? 'bg-zinc-900/90 border border-zinc-700/60 shadow-black/40'
          : 'bg-white/90 border border-gray-200/70 shadow-gray-300/40'
        }`}
      >
        {/* Header */}
        <div className={`px-4 py-2.5 border-b ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}>
          <div className={`text-[12px] font-semibold ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
            {selectedElements.length > 0
              ? `${selectedElements.length} element${selectedElements.length > 1 ? 's' : ''}`
              : 'Properties'}
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Stroke Color */}
          <Section label="Stroke" isDark={isDark}>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {STROKE_COLORS.map((c) => (
                <Swatch key={c} color={c} isDark={isDark} selected={properties.strokeColor === c}
                  onClick={() => onPropertyChange({ strokeColor: c })} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={properties.strokeColor} onChange={(e) => onPropertyChange({ strokeColor: e.target.value })}
                className="w-7 h-7 rounded-md" />
              <input type="text" value={properties.strokeColor} onChange={(e) => onPropertyChange({ strokeColor: e.target.value })}
                className={`flex-1 rounded-lg px-2 py-1 text-[11px] font-mono border outline-none transition-colors
                  ${isDark
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 focus:border-indigo-500/50'
                    : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-indigo-400'
                  }`}
              />
            </div>
          </Section>

          {/* Fill Color */}
          <Section label="Fill" isDark={isDark}>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {FILL_COLORS.map((c) => (
                <Swatch key={c} color={c} isDark={isDark} selected={properties.fillColor === c}
                  onClick={() => onPropertyChange({ fillColor: c })} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={properties.fillColor === 'transparent' ? '#ffffff' : properties.fillColor}
                onChange={(e) => onPropertyChange({ fillColor: e.target.value })}
                className="w-7 h-7 rounded-md" />
              <input type="text" value={properties.fillColor} onChange={(e) => onPropertyChange({ fillColor: e.target.value })}
                className={`flex-1 rounded-lg px-2 py-1 text-[11px] font-mono border outline-none transition-colors
                  ${isDark
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 focus:border-indigo-500/50'
                    : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-indigo-400'
                  }`}
              />
            </div>
          </Section>

          {/* Stroke Width & Style */}
          <Section label="Stroke Style" isDark={isDark}>
            <SliderRow isDark={isDark} label="Width" value={properties.strokeWidth} min={0.5} max={20} step={0.5}
              onChange={(v) => onPropertyChange({ strokeWidth: v })} format={(v) => `${v}px`} />
            <div className="flex gap-1 mt-3">
              {(['solid', 'dashed', 'dotted'] as const).map((s) => (
                <button key={s} onClick={() => onPropertyChange({ strokeStyle: s })} title={s}
                  className={`flex-1 h-8 rounded-lg text-[11px] font-medium cursor-pointer transition-all duration-150 border
                    ${properties.strokeStyle === s
                      ? isDark
                        ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
                        : 'border-indigo-400 bg-indigo-50 text-indigo-600'
                      : isDark
                        ? 'border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  {s === 'solid' ? '—' : s === 'dashed' ? '- -' : '···'}
                </button>
              ))}
            </div>
          </Section>

          {/* Roughness + Opacity */}
          <Section label="Appearance" isDark={isDark}>
            <div className="space-y-3">
              <SliderRow isDark={isDark} label="Roughness" value={properties.roughness} min={0} max={4} step={0.5}
                onChange={(v) => onPropertyChange({ roughness: v })} format={(v) => v.toString()} />
              <SliderRow isDark={isDark} label="Opacity" value={properties.opacity} min={0} max={100} step={1}
                onChange={(v) => onPropertyChange({ opacity: v })} format={(v) => `${v}%`} />
            </div>
          </Section>

          {/* Font */}
          {hasText && (
            <Section label="Typography" isDark={isDark}>
              <div className="space-y-3">
                <SliderRow isDark={isDark} label="Size" value={properties.fontSize} min={8} max={120} step={1}
                  onChange={(v) => onPropertyChange({ fontSize: v })} format={(v) => `${v}px`} />
                <select value={properties.fontFamily} onChange={(e) => onPropertyChange({ fontFamily: e.target.value })}
                  className={`w-full rounded-lg px-2 py-1.5 text-[11px] border outline-none cursor-pointer transition-colors
                    ${isDark
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 focus:border-indigo-500/50'
                      : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-indigo-400'
                    }`}
                >
                  <option value="Caveat, cursive">Caveat (Handwritten)</option>
                  <option value="sans-serif">Sans-serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
            </Section>
          )}
        </div>
      </div>
    </>
  );
});

export default PropertiesPanel;
