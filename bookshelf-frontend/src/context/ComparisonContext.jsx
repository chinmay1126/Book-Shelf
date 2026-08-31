import { createContext, useState, useCallback, useEffect } from 'react';

const defaultContextValue = {
  compareIds: [],
  compareCount: 0,
  maxCompare: 5,
  isComparing: () => false,
  toggleCompare: () => {},
  addToCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
};

export const ComparisonContext = createContext(defaultContextValue);

const STORAGE_KEY = 'bookshelf_compare';
const MAX_COMPARE = 5;

/**
 * Read the initial comparison list from localStorage.
 *
 * Trusts nothing from storage — validates every id before returning.
 */
function readCompareList(storage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === 'string' && id.trim() !== '').slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
}

function writeCompareList(storage, ids) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Quota or private browsing — silently degrade.
  }
}

/**
 * Provides comparison state and actions to the component tree.
 *
 * The list of compared book ids is persisted in localStorage so it survives
 * page reloads and is shared across tabs (via the storage event).
 */
export function ComparisonProvider({ children }) {
  const [compareIds, setCompareIds] = useState(() =>
    readCompareList(typeof window === 'undefined' ? null : window.localStorage)
  );

  // Persist on change
  useEffect(() => {
    writeCompareList(window.localStorage, compareIds);
  }, [compareIds]);

  // Sync across tabs
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== null && event.key !== STORAGE_KEY) return;
      setCompareIds(readCompareList(window.localStorage));
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isComparing = useCallback(
    (bookId) => compareIds.includes(bookId),
    [compareIds]
  );

  const toggleCompare = useCallback((bookId) => {
    setCompareIds((prev) => {
      if (prev.includes(bookId)) {
        return prev.filter((id) => id !== bookId);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev; // Already at max — the UI should show a message.
      }
      return [...prev, bookId];
    });
  }, []);

  const addToCompare = useCallback((bookId) => {
    setCompareIds((prev) => {
      if (prev.includes(bookId) || prev.length >= MAX_COMPARE) return prev;
      return [...prev, bookId];
    });
  }, []);

  const removeFromCompare = useCallback((bookId) => {
    setCompareIds((prev) => prev.filter((id) => id !== bookId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  return (
    <ComparisonContext.Provider
      value={{
        compareIds,
        compareCount: compareIds.length,
        maxCompare: MAX_COMPARE,
        isComparing,
        toggleCompare,
        addToCompare,
        removeFromCompare,
        clearCompare,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export default ComparisonContext;
