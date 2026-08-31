import { useContext } from 'react';
import { ComparisonContext } from '../context/ComparisonContext.jsx';

/**
 * Custom hook to access comparison state and actions safely.
 *
 * Provides defensive fallback defaults when rendered outside a ComparisonProvider,
 * preventing uncaught TypeErrors when components (like BookCard or BookDetail)
 * are rendered in isolated component trees or test environments.
 */
export function useComparison() {
  const context = useContext(ComparisonContext);

  if (!context) {
    return {
      compareIds: [],
      compareCount: 0,
      maxCompare: 5,
      isComparing: () => false,
      toggleCompare: () => {},
      addToCompare: () => {},
      removeFromCompare: () => {},
      clearCompare: () => {},
    };
  }

  return context;
}

export default useComparison;
