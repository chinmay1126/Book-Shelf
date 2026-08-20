import { describe, it, expect } from 'vitest';
import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  buildCatalogQuery,
  hasActiveFilters,
  normaliseCatalogFilters,
} from './catalogQuery.js';

const query = (filters) => buildCatalogQuery(filters).toString();

describe('buildCatalogQuery', () => {
  it('always sends page and limit', () => {
    expect(query({})).toBe(`page=1&limit=${DEFAULT_LIMIT}`);
  });

  it('sends the price filters the old page applied in the browser', () => {
    // This is the whole bug: minPrice and maxPrice were never in the request.
    const params = buildCatalogQuery({ minPrice: 100, maxPrice: 250 });
    expect(params.get('minPrice')).toBe('100');
    expect(params.get('maxPrice')).toBe('250');
  });

  it('sends minRating', () => {
    expect(buildCatalogQuery({ minRating: 4 }).get('minRating')).toBe('4');
  });

  it('sends each genre as a repeated parameter, which Express reads as an array', () => {
    const params = buildCatalogQuery({ genres: ['Fiction', 'Poetry'] });
    expect(params.getAll('genre')).toEqual(['Fiction', 'Poetry']);
    // The old page collapsed a multi-select to genre=All and filtered locally.
    expect(params.get('genre')).not.toBe('All');
  });

  it('omits the All sentinel entirely', () => {
    expect(buildCatalogQuery({ genres: ['All'] }).getAll('genre')).toEqual([]);
    expect(buildCatalogQuery({ genres: ['all'] }).getAll('genre')).toEqual([]);
  });

  it('drops blank genres rather than sending genre=', () => {
    expect(buildCatalogQuery({ genres: ['', '  ', 'Fiction'] }).getAll('genre')).toEqual([
      'Fiction',
    ]);
  });

  it('does not send a cleared price box as zero', () => {
    // <input type="number"> yields '' when cleared, and Number('') is 0 —
    // which the API would read as a deliberate "at least ₹0" filter.
    const params = buildCatalogQuery({ minPrice: '', maxPrice: '' });
    expect(params.has('minPrice')).toBe(false);
    expect(params.has('maxPrice')).toBe(false);
  });

  it('accepts the string values the number inputs actually produce', () => {
    expect(buildCatalogQuery({ minPrice: '100' }).get('minPrice')).toBe('100');
  });

  it('ignores a price that is not a number', () => {
    expect(buildCatalogQuery({ minPrice: 'cheap' }).has('minPrice')).toBe(false);
  });

  it('swaps a reversed range instead of letting the API 400 it', () => {
    const params = buildCatalogQuery({ minPrice: 500, maxPrice: 100 });
    expect(params.get('minPrice')).toBe('100');
    expect(params.get('maxPrice')).toBe('500');
  });

  it('trims the search term and omits an empty one', () => {
    expect(buildCatalogQuery({ search: '  quiet ' }).get('search')).toBe('quiet');
    expect(buildCatalogQuery({ search: '   ' }).has('search')).toBe(false);
  });

  it('sends inStock only when it is a real boolean', () => {
    expect(buildCatalogQuery({ inStock: true }).get('inStock')).toBe('true');
    expect(buildCatalogQuery({ inStock: false }).get('inStock')).toBe('false');
    expect(buildCatalogQuery({ inStock: null }).has('inStock')).toBe(false);
    expect(buildCatalogQuery({}).has('inStock')).toBe(false);
  });

  it('omits an empty sort rather than sending sort=', () => {
    expect(buildCatalogQuery({ sort: '' }).has('sort')).toBe(false);
    expect(buildCatalogQuery({ sort: 'price_asc' }).get('sort')).toBe('price_asc');
  });

  it('clamps the limit to what the API accepts', () => {
    expect(buildCatalogQuery({ limit: 500 }).get('limit')).toBe(String(MAX_LIMIT));
    expect(buildCatalogQuery({ limit: 0 }).get('limit')).toBe(String(DEFAULT_LIMIT));
    expect(buildCatalogQuery({ limit: 2.5 }).get('limit')).toBe(String(DEFAULT_LIMIT));
  });

  it('falls back to page 1 for a nonsensical page', () => {
    expect(buildCatalogQuery({ page: 0 }).get('page')).toBe('1');
    expect(buildCatalogQuery({ page: -3 }).get('page')).toBe('1');
    expect(buildCatalogQuery({ page: 'two' }).get('page')).toBe('1');
  });

  it('builds a complete query with everything set at once', () => {
    const params = buildCatalogQuery({
      search: 'quiet',
      genres: ['Fiction', 'Mystery'],
      minPrice: 100,
      maxPrice: 400,
      minRating: 4,
      inStock: true,
      sort: 'price_asc',
      page: 2,
      limit: 4,
    });

    expect(Object.fromEntries(params)).toMatchObject({
      page: '2',
      limit: '4',
      search: 'quiet',
      minPrice: '100',
      maxPrice: '400',
      minRating: '4',
      inStock: 'true',
      sort: 'price_asc',
    });
    expect(params.getAll('genre')).toEqual(['Fiction', 'Mystery']);
  });
});

describe('normaliseCatalogFilters', () => {
  it('accepts a single genre string as well as an array', () => {
    expect(normaliseCatalogFilters({ genres: 'Fiction' }).genres).toEqual(['Fiction']);
  });

  it('is stable, so it can key a dependency array', () => {
    const a = normaliseCatalogFilters({ search: ' x ', page: '3' });
    const b = normaliseCatalogFilters({ search: 'x', page: 3 });
    expect(a).toEqual(b);
  });
});

describe('hasActiveFilters', () => {
  it('is false for an untouched catalogue', () => {
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ genres: ['All'], minPrice: '', minRating: null })).toBe(false);
  });

  it('is true for each filter on its own', () => {
    expect(hasActiveFilters({ search: 'quiet' })).toBe(true);
    expect(hasActiveFilters({ genres: ['Fiction'] })).toBe(true);
    expect(hasActiveFilters({ minPrice: 100 })).toBe(true);
    expect(hasActiveFilters({ maxPrice: 100 })).toBe(true);
    expect(hasActiveFilters({ minRating: 4 })).toBe(true);
    expect(hasActiveFilters({ inStock: true })).toBe(true);
  });

  it('does not count sort or pagination as a filter', () => {
    expect(hasActiveFilters({ sort: 'price_asc', page: 3, limit: 4 })).toBe(false);
  });
});
