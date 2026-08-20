/**
 * Build the query string for GET /api/books.
 *
 * A pure function, deliberately: this is the exact mapping that was missing,
 * and it is far easier to be sure about as twenty assertions than as a page
 * that has to be rendered and a fetch that has to be intercepted.
 *
 * The bug (#319): Home sent only `page`, `limit`, `genre` and `search`, then
 * applied price, rating and multi-genre filters to the four books the server
 * had already paged down to. Filtering after pagination is filtering the
 * wrong set — the customer asked "books under ₹300" and got "of the four
 * books on page 1, the ones under ₹300", with the header still claiming
 * 16 titles and the pager still offering four pages.
 *
 * The backend has supported all of this since #274. `utils/bookQuery.js`
 * parses minPrice, maxPrice, minRating and inStock, `toList()` accepts both
 * repeated and comma-separated genres, and `queryBooks()` filters, then
 * sorts, then paginates — so totalBooks and totalPages already describe the
 * filtered set. The parameters were simply never sent.
 */

/** Matches DEFAULT_LIMIT in the backend's utils/bookQuery.js. */
export const DEFAULT_LIMIT = 12;

/** Matches MAX_LIMIT there too. The API rejects anything larger with a 400. */
export const MAX_LIMIT = 100;

/**
 * The sentinel the catalogue page uses for "no genre filter". The backend
 * strips it as well; not sending it at all is one less thing to agree about.
 */
const ALL_GENRES = 'all';

function appendIfPresent(params, key, value) {
  if (value === undefined || value === null || value === '') {
    return;
  }

  params.append(key, String(value));
}

/**
 * A number, or undefined if the input cannot be one.
 *
 * The price inputs are `<input type="number">`, which yields a *string* —
 * and an empty one when cleared. `Number('')` is 0, so a cleared "Min ₹"
 * box would otherwise send `minPrice=0` and read as a deliberate filter.
 */
function toNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toPositiveInteger(value, fallback) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

/**
 * Normalise the filter state into what the API accepts.
 *
 * Returns a plain object as well as the URLSearchParams, so a caller can key
 * a cache or a dependency array on the normalised shape rather than on five
 * separate pieces of component state.
 */
export function normaliseCatalogFilters(filters = {}) {
  const {
    search = '',
    genres = [],
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sort = '',
    page = 1,
    limit = DEFAULT_LIMIT,
  } = filters;

  const cleanGenres = (Array.isArray(genres) ? genres : [genres])
    .map((genre) => String(genre ?? '').trim())
    .filter((genre) => genre !== '' && genre.toLowerCase() !== ALL_GENRES);

  let min = toNumber(minPrice);
  let max = toNumber(maxPrice);

  // The API answers minPrice > maxPrice with a 400. A customer who typed
  // them the wrong way round meant a range, so read it as one rather than
  // showing them a validation error about their own typing.
  if (min !== undefined && max !== undefined && min > max) {
    [min, max] = [max, min];
  }

  return {
    search: String(search ?? '').trim(),
    genres: cleanGenres,
    minPrice: min !== undefined && min >= 0 ? min : undefined,
    maxPrice: max !== undefined && max >= 0 ? max : undefined,
    minRating: toNumber(minRating),
    inStock: typeof inStock === 'boolean' ? inStock : undefined,
    sort: String(sort ?? '').trim(),
    page: toPositiveInteger(page, 1),
    limit: Math.min(toPositiveInteger(limit, DEFAULT_LIMIT), MAX_LIMIT),
  };
}

/**
 * The URLSearchParams for a set of filters.
 *
 * Genres are appended one at a time rather than joined, because
 * `?genre=Fiction&genre=Poetry` is what Express hands the backend as an
 * array. The old page collapsed a multi-select to `genre=All` and filtered
 * the fetched page in the browser instead.
 */
export function buildCatalogQuery(filters = {}) {
  const normalised = normaliseCatalogFilters(filters);
  const params = new URLSearchParams();

  params.set('page', String(normalised.page));
  params.set('limit', String(normalised.limit));

  appendIfPresent(params, 'search', normalised.search);

  for (const genre of normalised.genres) {
    params.append('genre', genre);
  }

  appendIfPresent(params, 'minPrice', normalised.minPrice);
  appendIfPresent(params, 'maxPrice', normalised.maxPrice);
  appendIfPresent(params, 'minRating', normalised.minRating);

  if (normalised.inStock !== undefined) {
    params.set('inStock', String(normalised.inStock));
  }

  appendIfPresent(params, 'sort', normalised.sort);

  return params;
}

/** Whether anything is narrowing the catalogue right now. */
export function hasActiveFilters(filters = {}) {
  const { search, genres, minPrice, maxPrice, minRating, inStock } =
    normaliseCatalogFilters(filters);

  return (
    search !== '' ||
    genres.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    minRating !== undefined ||
    inStock !== undefined
  );
}

export default {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  normaliseCatalogFilters,
  buildCatalogQuery,
  hasActiveFilters,
};
