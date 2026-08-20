import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) =>
      key === 'home.titlesTotal' ? `${options?.count ?? 0} titles total` : key,
  }),
}));

vi.mock('../components/Hero.jsx', () => ({ default: () => <div /> }));
vi.mock('../components/SkeletonLoader.jsx', () => ({
  default: () => <div data-testid="skeleton" />,
}));
vi.mock('../components/BookCard.jsx', () => ({
  default: ({ book }) => <div data-testid="book-card">{book.title}</div>,
}));

import { CartProvider } from '../context/CartContext.jsx';
import { WishlistContext } from '../context/WishlistContext.jsx';
import Home from './Home.jsx';

const wishlist = {
  wishlist: [],
  loading: false,
  count: 0,
  isWishlisted: () => false,
  toggleWishlist: vi.fn(),
};

const CATALOGUE = [
  { id: 'b1', title: 'The Quiet Ones', genre: 'Fiction', price: 349, rating: 4.5, inventory: 8 },
  { id: 'b2', title: 'Field Notes', genre: 'Self-Help', price: 299, rating: 4.2, inventory: 10 },
  { id: 'b5', title: 'Low Tide', genre: 'Poetry', price: 249, rating: 4.1, inventory: 6 },
  { id: 'b7', title: 'Paper Trail', genre: 'Mystery', price: 199, rating: 3.9, inventory: 4 },
];

/**
 * A stand-in for the backend's queryBooks(): filter the whole catalogue,
 * then paginate. The point of these tests is that the page asks the server
 * for the right thing and trusts what comes back, so the stand-in has to
 * behave like the real one.
 */
function fakeApi(url) {
  const params = new URL(url, 'http://localhost').searchParams;

  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');
  const minRating = params.get('minRating');
  const genres = params.getAll('genre');
  const search = params.get('search');

  let filtered = CATALOGUE.filter((book) => {
    if (minPrice !== null && book.price < Number(minPrice)) return false;
    if (maxPrice !== null && book.price > Number(maxPrice)) return false;
    if (minRating !== null && book.rating < Number(minRating)) return false;
    if (genres.length > 0 && !genres.includes(book.genre)) return false;
    if (search && !book.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const limit = Number(params.get('limit')) || 4;
  const page = Number(params.get('page')) || 1;
  const totalPages = filtered.length === 0 ? 0 : Math.ceil(filtered.length / limit);

  return {
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        books: filtered.slice((page - 1) * limit, page * limit),
        page,
        limit,
        totalBooks: filtered.length,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }),
  };
}

function renderHome() {
  return render(
    <MemoryRouter>
      <WishlistContext.Provider value={wishlist}>
        <CartProvider>
          <Home searchQuery="" />
        </CartProvider>
      </WishlistContext.Provider>
    </MemoryRouter>
  );
}

const titles = () =>
  screen.queryAllByTestId('book-card').map((card) => card.textContent);

describe('Home catalogue', () => {
  beforeEach(() => {
    window.localStorage.clear();
    globalThis.fetch = vi.fn((url) => Promise.resolve(fakeApi(url)));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists the catalogue', async () => {
    renderHome();
    await waitFor(() => expect(titles()).toHaveLength(4));
  });

  it('finds a cheap book that is not on the first page', async () => {
    // The reported symptom: with 4-per-page and client-side filtering, "Max
    // ₹250" showed "No books found." while a ₹249 book sat on page 2.
    const user = userEvent.setup();
    renderHome();
    await waitFor(() => expect(titles()).toHaveLength(4));

    await user.type(screen.getByLabelText('Maximum price in rupees'), '250');

    await waitFor(() => expect(titles()).toEqual(['Low Tide', 'Paper Trail']));
    expect(screen.queryByText('home.noBooksFound')).not.toBeInTheDocument();
  });

  it('counts the filtered set, not the whole catalogue', async () => {
    const user = userEvent.setup();
    renderHome();
    await waitFor(() => expect(titles()).toHaveLength(4));

    await user.type(screen.getByLabelText('Maximum price in rupees'), '250');

    // The header used to read "16 titles total" above a single card.
    await waitFor(() =>
      expect(screen.getByText('2 titles total')).toBeInTheDocument()
    );
  });

  it('asks the API for every checked genre', async () => {
    const user = userEvent.setup();
    renderHome();
    await waitFor(() => expect(titles()).toHaveLength(4));

    await user.click(screen.getByLabelText('Fiction'));
    await user.click(screen.getByLabelText('Mystery'));

    await waitFor(() => {
      const url = globalThis.fetch.mock.calls.at(-1)[0];
      expect(url).toContain('genre=Fiction&genre=Mystery');
    });
    await waitFor(() => expect(titles()).toEqual(['The Quiet Ones', 'Paper Trail']));
  });

  it('returns to page 1 when a filter changes', async () => {
    const user = userEvent.setup();
    renderHome();
    await waitFor(() => expect(titles()).toHaveLength(4));

    // A price filter used to leave the reader stranded on a page number that
    // no longer existed, and the API answers a page past the end with an
    // empty slice rather than an error — so the symptom was a blank grid.
    await user.type(screen.getByLabelText('Minimum price in rupees'), '100');

    await waitFor(() => {
      const url = globalThis.fetch.mock.calls.at(-1)[0];
      expect(url).toContain('page=1');
    });
  });

  it('offers a retry when the catalogue fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.fetch
      .mockRejectedValueOnce(new Error('Network down'))
      .mockImplementation((url) => Promise.resolve(fakeApi(url)));

    const user = userEvent.setup();
    renderHome();

    expect(await screen.findByText('home.errorLoading')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(titles()).toHaveLength(4));
  });

  it('clears every filter at once', async () => {
    const user = userEvent.setup();
    renderHome();
    await waitFor(() => expect(titles()).toHaveLength(4));

    await user.click(screen.getByLabelText('Fiction'));
    await waitFor(() => expect(titles()).toEqual(['The Quiet Ones']));

    await user.click(screen.getByRole('button', { name: /clear all ✕/i }));
    await waitFor(() => expect(titles()).toHaveLength(4));
  });
});
