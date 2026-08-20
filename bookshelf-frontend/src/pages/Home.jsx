import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Hero from '../components/Hero.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import BookCard from '../components/BookCard.jsx';
import Pagination from '../components/Pagination.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { useBookCatalog } from '../hooks/useBookCatalog.js';
import { hasActiveFilters } from '../utils/catalogQuery.js';

// Genre list is static because the catalogue is. GET /api/books/genres
// exists and returns these with counts; wiring it up is a separate change.
const ALL_GENRES = ['All', 'Fiction', 'Sci-Fi', 'Mystery', 'Self-Help', 'Poetry'];

const PAGE_SIZE = 4;

export default function Home({ searchQuery: searchQueryProp }) {
  const { t } = useTranslation();

  // The search box lives in the navbar, which the App layout renders, so the
  // query reaches this page through the outlet context. The prop is kept as
  // an override so Home can still be rendered standalone in tests.
  const outletContext = useOutletContext();
  const searchQuery = searchQueryProp ?? outletContext?.searchQuery ?? '';

  const [currentPage, setCurrentPage] = useState(1);
  const [activeSort, setActiveSort] = useState('');

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filters = useMemo(
    () => ({
      search: searchQuery,
      genres: selectedGenres,
      minPrice,
      maxPrice,
      minRating,
      sort: activeSort,
      page: currentPage,
      limit: PAGE_SIZE,
    }),
    [searchQuery, selectedGenres, minPrice, maxPrice, minRating, activeSort, currentPage]
  );

  /*
   * Every filter now goes to the API, which filters the whole catalogue and
   * then paginates it. Previously the price, rating and multi-genre filters
   * ran in a useMemo over the four books the server had already paged down
   * to — so "Max ₹250" showed "No books found." while a ₹249 book sat on
   * page 2, and the header still read "16 titles total" above it. See #319.
   */
  const { books, totalBooks, totalPages, loading, error, reload } =
    useBookCatalog(filters);

  const filtersActive = hasActiveFilters({
    genres: selectedGenres,
    minPrice,
    maxPrice,
    minRating,
  });

  /*
   * Any change to what is being asked for returns to page 1.
   *
   * The old effect listed only search, genre and sort, so changing a price
   * filter left the reader on page 3 of a result set that no longer had
   * three pages — and the API answers a page past the end with an empty
   * slice, not an error, so the symptom was a blank grid.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenres, minPrice, maxPrice, minRating, activeSort]);

  const handleGenreChange = useCallback((genre, checked) => {
    setSelectedGenres((previous) =>
      checked
        ? [...previous, genre]
        : previous.filter((entry) => entry !== genre)
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedGenres([]);
    setMinPrice('');
    setMaxPrice('');
    setMinRating(null);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <Hero />
      <main className="catalog" id="catalog">
        <div className="catalog__inner">

          <div className="catalog__header">
            <h2 className="catalog__title">{t('home.featuredTitle')}</h2>
            {/* Counts the filtered set, because the server counted it. */}
            <p className="catalog__count">
              {t('home.titlesTotal', { count: totalBooks })}
            </p>
          </div>

          <div className="catalog__layout">

            <FilterSidebar
              genres={ALL_GENRES}
              selectedGenres={selectedGenres}
              onGenreChange={handleGenreChange}
              minPrice={minPrice}
              onMinPriceChange={setMinPrice}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              onClearFilters={handleClearFilters}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen((open) => !open)}
            />

            <div className="catalog__grid-container">

              <div className="catalog__controls">
                <select
                  id="sort-select"
                  className="catalog__sort-select"
                  value={activeSort}
                  onChange={(event) => setActiveSort(event.target.value)}
                  aria-label={t('home.sortAriaLabel')}
                >
                  <option value="">{t('home.sortDefault')}</option>
                  <option value="price_asc">{t('home.sortPriceAsc')}</option>
                  <option value="price_desc">{t('home.sortPriceDesc')}</option>
                  <option value="rating_desc">{t('home.sortRatingDesc')}</option>
                  <option value="title_asc">{t('home.sortTitleAsc')}</option>
                </select>
              </div>

              {filtersActive && (
                <div className="catalog__filter-summary">
                  <span>Active filters:</span>
                  {selectedGenres.map((genre) => (
                    <span key={genre} className="catalog__filter-tag">
                      {genre}
                      <button
                        onClick={() => handleGenreChange(genre, false)}
                        aria-label={`Remove ${genre} filter`}
                      >✕</button>
                    </span>
                  ))}
                  {minPrice !== '' && (
                    <span className="catalog__filter-tag">
                      Min ₹{minPrice}
                      <button onClick={() => setMinPrice('')} aria-label="Remove min price filter">✕</button>
                    </span>
                  )}
                  {maxPrice !== '' && (
                    <span className="catalog__filter-tag">
                      Max ₹{maxPrice}
                      <button onClick={() => setMaxPrice('')} aria-label="Remove max price filter">✕</button>
                    </span>
                  )}
                  {minRating !== null && (
                    <span className="catalog__filter-tag">
                      {'★'.repeat(minRating)} & up
                      <button onClick={() => setMinRating(null)} aria-label="Remove rating filter">✕</button>
                    </span>
                  )}
                  <button className="catalog__filter-tag" onClick={handleClearFilters}>
                    Clear all ✕
                  </button>
                </div>
              )}

              {loading ? (
                <div className="catalog__grid">
                  <SkeletonLoader variant="card" count={PAGE_SIZE} />
                </div>
              ) : error ? (
                <div className="catalog__empty">
                  <h3>{t('home.errorLoading')}</h3>
                  <p className="catalog__error-detail">{error}</p>
                  <button className="catalog__empty-btn" onClick={reload}>
                    Try again
                  </button>
                </div>
              ) : books.length === 0 ? (
                <div className="catalog__empty">
                  <h3>{t('home.noBooksFound')}</h3>
                  {filtersActive && (
                    <button className="catalog__empty-btn" onClick={handleClearFilters}>
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="catalog__grid">
                    {books.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                  {/* totalPages describes the filtered set now, so the pager
                      no longer offers pages that render empty. */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}

            </div>{/* end .catalog__grid-container */}
          </div>{/* end .catalog__layout */}
        </div>
      </main>
    </>
  );
}
