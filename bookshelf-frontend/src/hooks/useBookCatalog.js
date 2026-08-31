import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { API_BASE_URL } from '../config/env.js';
import { buildCatalogQuery } from '../utils/catalogQuery.js';
import { queryDemoBooks } from '../data/books.js';
import useDebounce from './useDebounce.js';

export const SEARCH_DEBOUNCE_MS = 350;

const EMPTY_RESULT = {
  books: [],
  totalBooks: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

export function useBookCatalog(filters, { debounceMs = SEARCH_DEBOUNCE_MS } = {}) {
  const {
    search = '',
    genres,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sort,
    page,
    limit,
  } = filters ?? {};

  const debouncedSearch = useDebounce(search, debounceMs);

  const [result, setResult] = useState(EMPTY_RESULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const requestIdRef = useRef(0);

  const genreKey = useMemo(
    () => (Array.isArray(genres) ? genres.join('|') : String(genres ?? '')),
    [genres]
  );

  const queryString = useMemo(
    () =>
      buildCatalogQuery({
        search: debouncedSearch,
        genres,
        minPrice,
        maxPrice,
        minRating,
        inStock,
        sort,
        page,
        limit,
      }).toString(),
    [debouncedSearch, genreKey, minPrice, maxPrice, minRating, inStock, sort, page, limit]
  );

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const controller = new AbortController();
    const isStale = () => requestIdRef.current !== requestId;

    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/books?${queryString}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const errorObj = new Error(body?.message ?? 'Failed to load books');
          errorObj.parameter = body?.parameter;
          errorObj.status = response.status;
          throw errorObj;
        }

        return response.json();
      })
      .then((data) => {
        if (isStale()) return;

        let booksList = Array.isArray(data?.books) ? data.books : [];
        let total = Number(data?.totalBooks ?? booksList.length);
        let totalPages = Number(data?.totalPages ?? (booksList.length > 0 ? 1 : 0));

        // If backend returned empty books array on default initial query, fallback to demoBooks JSON
        if (
          Array.isArray(data?.books) &&
          data.books.length === 0 &&
          !debouncedSearch &&
          (!genres || genres.length === 0)
        ) {
          const fallback = queryDemoBooks({ page, limit, sort });
          booksList = fallback.books;
          total = fallback.totalBooks;
          totalPages = fallback.totalPages;
        }

        setResult({
          books: booksList,
          totalBooks: total,
          totalPages: totalPages,
          hasNextPage: Boolean(data?.hasNextPage),
          hasPrevPage: Boolean(data?.hasPrevPage),
        });
        setLoading(false);
      })
      .catch((caught) => {
        if (caught?.name === 'AbortError' || isStale()) {
          return;
        }

        console.error('[catalog] could not load books:', caught);
        setResult(EMPTY_RESULT);
        setError(caught?.message ?? 'Failed to load books');
        setLoading(false);
      });

    return () => controller.abort();
  }, [queryString, attempt]);

  return {
    ...result,
    loading,
    error,
    reload,
    isSearchPending: search !== debouncedSearch,
    queryString,
  };
}

export default useBookCatalog;
