import { renderHook, act } from '@testing-library/react';
import { ComparisonProvider } from '../context/ComparisonContext.jsx';
import { useComparison } from './useComparison.js';

describe('useComparison', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default fallback state when used outside ComparisonProvider without throwing', () => {
    const { result } = renderHook(() => useComparison());
    expect(result.current.compareIds).toEqual([]);
    expect(result.current.compareCount).toBe(0);
    expect(result.current.maxCompare).toBe(5);
    expect(result.current.isComparing('b1')).toBe(false);
  });

  it('provides state and actions within ComparisonProvider', () => {
    const wrapper = ({ children }) => (
      <ComparisonProvider>{children}</ComparisonProvider>
    );

    const { result } = renderHook(() => useComparison(), { wrapper });

    expect(result.current.compareIds).toEqual([]);
    expect(result.current.compareCount).toBe(0);
    expect(result.current.isComparing('book-1')).toBe(false);

    // Toggle book-1 on
    act(() => {
      result.current.toggleCompare('book-1');
    });

    expect(result.current.compareIds).toEqual(['book-1']);
    expect(result.current.compareCount).toBe(1);
    expect(result.current.isComparing('book-1')).toBe(true);

    // Add book-2
    act(() => {
      result.current.addToCompare('book-2');
    });

    expect(result.current.compareIds).toEqual(['book-1', 'book-2']);
    expect(result.current.compareCount).toBe(2);

    // Remove book-1
    act(() => {
      result.current.removeFromCompare('book-1');
    });

    expect(result.current.compareIds).toEqual(['book-2']);
    expect(result.current.compareCount).toBe(1);

    // Clear all
    act(() => {
      result.current.clearCompare();
    });

    expect(result.current.compareIds).toEqual([]);
    expect(result.current.compareCount).toBe(0);
  });

  it('enforces maximum limit of 5 compared books', () => {
    const wrapper = ({ children }) => (
      <ComparisonProvider>{children}</ComparisonProvider>
    );

    const { result } = renderHook(() => useComparison(), { wrapper });

    act(() => {
      ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'].forEach((id) => {
        result.current.addToCompare(id);
      });
    });

    expect(result.current.compareIds).toEqual(['b1', 'b2', 'b3', 'b4', 'b5']);
    expect(result.current.compareCount).toBe(5);
  });
});
