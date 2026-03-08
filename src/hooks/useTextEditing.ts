import { useCallback, useRef } from 'react';
import { ExcalidrawElement, TextElement } from '../types';
import { useAppState } from '../context/AppContext';
import { measureText } from '../lib/elements';

export function useTextEditing(pushHistory: (els: ExcalidrawElement[]) => void) {
  const { setElements, setSelectedIds, setEditingTextId, stateRef } = useAppState();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startTextEditing = useCallback((el: TextElement) => {
    setEditingTextId(el.id);
    setSelectedIds(new Set([el.id]));
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.value = el.text;
        textareaRef.current.focus();
        textareaRef.current.select();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, 0);
  }, [setEditingTextId, setSelectedIds]);

  const commitTextEdit = useCallback(() => {
    const { editingTextId, elements } = stateRef.current;
    if (!editingTextId) return;

    const text = textareaRef.current?.value ?? '';
    const newEls = elements.reduce<ExcalidrawElement[]>((acc, el) => {
      if (el.id !== editingTextId || el.type !== 'text') {
        acc.push(el);
        return acc;
      }
      if (text.trim() === '' && el.text === '') return acc;
      const { width, height } = measureText(text, el.fontSize, el.fontFamily);
      acc.push({ ...el, text, width: Math.max(width, 10), height: Math.max(height, el.fontSize) });
      return acc;
    }, []);

    setElements(newEls);
    pushHistory(newEls);
    setEditingTextId(null);
  }, [pushHistory, setElements, setEditingTextId, stateRef]);

  return { textareaRef, startTextEditing, commitTextEdit };
}
