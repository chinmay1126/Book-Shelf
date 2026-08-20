import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';

import { useBookCatalog } from './useBookCatalog.js';

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  };
}

const PAGE = {
  books: [{ id: 'b5', title: 'Low Tide', price: 249, rating: 4.1 }],
  page: 1,
  limit: 4,
  totalBooks: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

function Probe({ filters }) {
  const { books, totalBooks, totalPages, loading, error, queryString } =
    useBookCatalog(filters, { debounceMs: 20 });

  return (
    <div>
      <span data-testid="state">{loading ? 'loading' : error ? 'error' : 'ready'}</span>
      <span data-testid="titles">{books.map((b) => b.title).join(',')}</span>
      <span data-testid="total-books">{totalBooks}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <span data-testid="query">{queryString}</span>
      <span data-testid="error">{error ?? ''}</span>
    </div>
  );
}

const lastUrl = () => globalThis.fetch.mock.calls.at(-1)[0];

describe('useBookCatalog', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(() => Promise.resolve(jsonResponse(PAGE)));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the price and rating filters to the API', async () => {
    render(<Probe filters={{ minPrice: 100, maxPrice: 250, minRating: 4, limit: 4 }} />);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());

    const url = lastUrl();
    // The old page never put these in the request at all.
    expect(url).toContain('minPrice=100');
    expect(url).toContain('maxPrice=250');
    expect(url).toContain('minRating=4');
  });

  it('sends multiple genres rather than collapsing them to All', async () => {
    render(<Probe filters={{ genres: ['Fiction', 'Poetry'], limit: 4 }} />);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());

    expect(lastUrl()).toContain('genre=Fiction&genre=Poetry');
    expect(lastUrl()).not.toContain('genre=All');
  });

  it('reports the totals the server calculated for the filtered set', async () => {
    globalThis.fetch.mockResolvedValue(
      jsonResponse({ ...PAGE, totalBooks: 1, totalPages: 1 })
    );

    render(<Probe filters={{ maxPrice: 250, limit: 4 }} />);

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('ready'));
    // The header used to read "16 titles total" above one filtered card.
    expect(screen.getByTestId('total-books')).toHaveTextContent('1');
    expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
  });

  it('debounces the search box instead of firing per keystroke', async () => {
    vi.useFakeTimers();

    const { rerender } = render(<Probe filters={{ search: '', limit: 4 }} />);
    for (const term of ['m', 'my', 'mys', 'myst', 'mystery']) {
      rerender(<Probe filters={{ search: term, limit: 4 }} />);
    }

    // One request for the initial empty search; none yet for the typing.
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    vi.useRealTimers();

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(2));
    expect(lastUrl()).toContain('search=mystery');
  });

  it('does not debounce a checkbox or a sort — those are single deliberate acts', async () => {
    const { rerender } = render(<Probe filters={{ limit: 4 }} />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));

    rerender(<Probe filters={{ limit: 4, sort: 'price_asc' }} />);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(2));
  });

  it('aborts the in-flight request when the query changes', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

    const { rerender } = render(<Probe filters={{ limit: 4, page: 1 }} />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));

    rerender(<Probe filters={{ limit: 4, page: 2 }} />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(2));

    expect(abortSpy).toHaveBeenCalled();
  });

  it('drops a slow response for a query the reader has moved past', async () => {
    let resolveFirst;
    globalThis.fetch
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockResolvedValueOnce(
        jsonResponse({ ...PAGE, books: [{ id: 'b2', title: 'Field Notes' }] })
      );

    const { rerender } = render(<Probe filters={{ limit: 4, page: 1 }} />);
    rerender(<Probe filters={{ limit: 4, page: 2 }} />);

    await waitFor(() => expect(screen.getByTestId('titles')).toHaveTextContent('Field Notes'));

    resolveFirst(jsonResponse({ ...PAGE, books: [{ id: 'b9', title: 'Stale Result' }] }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByTestId('titles')).toHaveTextContent('Field Notes');
    expect(screen.getByTestId('titles')).not.toHaveTextContent('Stale Result');
  });

  it('surfaces the parameter the API objected to', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.fetch.mockResolvedValue(
      jsonResponse(
        { message: 'minRating must be at least 0, received -1', parameter: 'minRating' },
        { ok: false, status: 400 }
      )
    );

    render(<Probe filters={{ minRating: -1, limit: 4 }} />);

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('error'));
    expect(screen.getByTestId('error')).toHaveTextContent('minRating must be at least 0');
  });

  it('reports a transport failure without leaving stale books on screen', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.fetch.mockRejectedValue(new Error('Network down'));

    render(<Probe filters={{ limit: 4 }} />);

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('error'));
    expect(screen.getByTestId('titles')).toHaveTextContent('');
  });

  it('tolerates a response body that is not the shape it expects', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({ unexpected: true }));

    render(<Probe filters={{ limit: 4 }} />);

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('ready'));
    expect(screen.getByTestId('total-books')).toHaveTextContent('0');
  });
});
