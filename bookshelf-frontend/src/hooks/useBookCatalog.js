import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { API_BASE_URL } from '../config/env.js';
import { buildCatalogQuery } from '../utils/catalogQuery.js';
import useDebounce from './useDebounce.js';

/**
 * A page of the catalogue, with every filter applied by the server.
 *
 * Two problems this closes (#319).
 *
 * The filters. Home fetched a page of four books and then applied the price,
 * rating and multi-genre filters to those four in the browser, so "under
 * ₹300" showed the empty state whenever page 1 happened to contain nothing
 * that cheap, while the header claimed 16 titles and the pager offered four
 * pages. Everything goes to the API now, which filters the whole catalogue
 * before it paginates — so `totalBooks` and `totalPages` describe what the
 * customer actually asked for.
 *
 * The search box. `searchQuery` was a direct dependency of the fetch effect,
 * so every keystroke fired a request — "mystery" was seven of them — with no
 * AbortController and no sequence check, meaning a slow response for `myst`
 * could land after `mystery` and overwrite the results with stale ones.
 * `hooks/useDebounce.js` had been in the repo, imported by nothing, since it
 * was added.
 */
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

  // Only the free-text box is debounced. A checkbox or a select is one
  // deliberate action, and delaying it just makes the UI feel broken.
  const debouncedSearch = useDebounce(search, debounceMs);

  const [result, setResult] = useState(EMPTY_RESULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const requestIdRef = useRef(0);

  // Genres is an array rebuilt on every render, so it cannot be a dependency
  // directly without refetching forever.
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
    // genreKey stands in for `genres` here: the array is rebuilt on every
    // render of the page, so depending on it directly would refetch forever.
    // The rest are primitives.
    [debouncedSearch, genreKey, minPrice, maxPrice, minRating, inStock, sort, page, limit]
  );

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const controller = new AbortController();

    // A response for a query the customer has already moved past must not be
    // painted over the current one.
    const isStale = () => requestIdRef.current !== requestId;

    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/books?${queryString}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          // The API answers a bad query with { message, parameter }; showing
          // that beats "Failed to load books" when the cause is a filter the
          // customer can change.
          const body = await response.json().catch(() => null);
          const error = new Error(body?.message ?? 'Failed to load books');
          error.parameter = body?.parameter;
          error.status = response.status;
          throw error;
        }

        return response.json();
      })
      .then((data) => {
        if (isStale()) return;

        setResult({
          books: Array.isArray(data?.books) ? data.books : [],
          totalBooks: Number(data?.totalBooks ?? 0),
          totalPages: Number(data?.totalPages ?? 0),
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
    // Exposed so the page can tell "typing" from "loaded", and so tests can
    // assert the debounce rather than guess at it.
    isSearchPending: search !== debouncedSearch,
    queryString,
  };
}

export default useBookCatalog;
