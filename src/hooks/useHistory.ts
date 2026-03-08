import { useCallback, useRef, useState } from 'react';
import { ExcalidrawElement } from '../types';
import { useAppState } from '../context/AppContext';

export function useHistory() {
  const { setElements, setSelectedIds } = useAppState();

  const historyRef = useRef<{ stack: ExcalidrawElement[][]; index: number }>({
    stack: [[]],
    index: 0,
  });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushHistory = useCallback((els: ExcalidrawElement[]) => {
    const { stack, index } = historyRef.current;
    const newStack = stack.slice(0, index + 1);
    newStack.push(JSON.parse(JSON.stringify(els)));
    historyRef.current = { stack: newStack, index: newStack.length - 1 };
    setCanUndo(newStack.length > 1);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const { stack, index } = historyRef.current;
    if (index <= 0) return;
    const newIndex = index - 1;
    historyRef.current.index = newIndex;
    setElements(JSON.parse(JSON.stringify(stack[newIndex])));
    setSelectedIds(new Set());
    setCanUndo(newIndex > 0);
    setCanRedo(true);
  }, [setElements, setSelectedIds]);

  const redo = useCallback(() => {
    const { stack, index } = historyRef.current;
    if (index >= stack.length - 1) return;
    const newIndex = index + 1;
    historyRef.current.index = newIndex;
    setElements(JSON.parse(JSON.stringify(stack[newIndex])));
    setSelectedIds(new Set());
    setCanUndo(true);
    setCanRedo(newIndex < stack.length - 1);
  }, [setElements, setSelectedIds]);

  return { pushHistory, undo, redo, canUndo, canRedo };
}
