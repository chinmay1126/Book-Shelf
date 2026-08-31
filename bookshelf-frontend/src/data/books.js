// Demo books data in JSON format for the frontend.
// Serves as rich local dataset and offline fallback when API is unreachable.

export const demoBooks = [
  {
    id: "b1",
    title: "The Quiet Ones",
    author: "M. Arora",
    genre: "Fiction",
    price: 349,
    rating: 4.8,
    reviewsCount: 24,
    inventory: 8,
    description: "A poignant exploration of memory, silence, and untold stories set across decades of family history in old Delhi.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
    cover: "#7A2E2E",
    pages: 320,
    __v: 1
  },
  {
    id: "b2",
    title: "Field Notes",
    author: "D. Kapoor",
    genre: "Self-Help",
    price: 299,
    rating: 4.2,
    reviewsCount: 15,
    inventory: 10,
    description: "Practical reflections on mindfulness, daily focus, and cultivating calm amidst modern turmoil.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    cover: "#1F4B43",
    pages: 240,
    __v: 1
  },
  {
    id: "b3",
    title: "Half Moon Bay",
    author: "S. Rhee",
    genre: "Mystery",
    price: 399,
    rating: 4.7,
    reviewsCount: 38,
    inventory: 12,
    description: "When coastal fog rolls over Half Moon Bay, secrets buried for thirty years begin to resurface.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
    cover: "#B85C2C",
    pages: 380,
    __v: 1
  },
  {
    id: "b4",
    title: "Static",
    author: "A. Voss",
    genre: "Sci-Fi",
    price: 449,
    rating: 4.3,
    reviewsCount: 19,
    inventory: 5,
    description: "In an abandoned orbital station, a technician intercepts frequencies echoing from a future that never was.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    cover: "#3A3F63",
    pages: 410,
    __v: 1
  },
  {
    id: "b5",
    title: "Low Tide",
    author: "R. Menon",
    genre: "Poetry",
    price: 249,
    rating: 4.6,
    reviewsCount: 11,
    inventory: 14,
    description: "Lyrical verses capturing the ebb and flow of coastal solitude, longing, and sunrise light.",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    cover: "#5F7A61",
    pages: 160,
    __v: 1
  },
  {
    id: "b6",
    title: "The Long Corridor",
    author: "K. Iyer",
    genre: "Mystery",
    price: 379,
    rating: 4.1,
    reviewsCount: 16,
    inventory: 7,
    description: "An ancient library holds a sealed manuscript—and a detective determined to decipher its final chapter.",
    coverImage: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=600&q=80",
    cover: "#93461F",
    pages: 295,
    __v: 1
  },
  {
    id: "b7",
    title: "Paper Moths",
    author: "L. Fischer",
    genre: "Fiction",
    price: 329,
    rating: 4.4,
    reviewsCount: 22,
    inventory: 9,
    description: "Two artists correspond across continents during the turn of the century through delicate, origami-folded letters.",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
    cover: "#2E4057",
    pages: 350,
    __v: 1
  },
  {
    id: "b8",
    title: "Ordinary Weather",
    author: "N. Basu",
    genre: "Self-Help",
    price: 279,
    rating: 4.0,
    reviewsCount: 14,
    inventory: 11,
    description: "Navigating life's subtle storms with grace, resilience, and quiet everyday wisdom.",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    cover: "#7A5C2E",
    pages: 220,
    __v: 1
  }
];

export const spines = [
  {
    id: 's1',
    title: 'The Quiet Ones',
    author: 'M. Arora',
    color: '#7A2E2E',
    height: 236,
  },
  {
    id: 's2',
    title: 'Field Notes',
    author: 'D. Kapoor',
    color: '#1F4B43',
    height: 210,
  },
  {
    id: 's3',
    title: 'Half Moon Bay',
    author: 'S. Rhee',
    color: '#B85C2C',
    height: 250,
  },
  {
    id: 's4',
    title: 'Static',
    author: 'A. Voss',
    color: '#3A3F63',
    height: 222,
  },
  {
    id: 's5',
    title: 'Low Tide',
    author: 'R. Menon',
    color: '#5F7A61',
    height: 240,
  },
  {
    id: 's6',
    title: 'The Long Corridor',
    author: 'K. Iyer',
    color: '#93461F',
    height: 214,
  },
  {
    id: 's7',
    title: 'Paper Moths',
    author: 'L. Fischer',
    color: '#2E4057',
    height: 232,
  },
  {
    id: 's8',
    title: 'Ordinary Weather',
    author: 'N. Basu',
    color: '#7A5C2E',
    height: 218,
  },
];

/**
 * Filter, sort, and paginate demoBooks locally when API is offline.
 */
export function queryDemoBooks(filters = {}) {
  const {
    search = '',
    genres = [],
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sort = '',
    page = 1,
    limit = 12,
  } = filters;

  let filtered = [...demoBooks];

  // Search filter
  if (search && search.trim() !== '') {
    const term = search.toLowerCase().trim();
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        b.genre.toLowerCase().includes(term)
    );
  }

  // Genre filter
  const activeGenres = (Array.isArray(genres) ? genres : [genres]).filter(
    (g) => g && g !== 'all'
  );
  if (activeGenres.length > 0) {
    filtered = filtered.filter((b) =>
      activeGenres.some((g) => g.toLowerCase() === b.genre.toLowerCase())
    );
  }

  // Price filter
  if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
    filtered = filtered.filter((b) => b.price >= Number(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
    filtered = filtered.filter((b) => b.price <= Number(maxPrice));
  }

  // Rating filter
  if (minRating !== undefined && minRating !== null && minRating !== '') {
    filtered = filtered.filter((b) => b.rating >= Number(minRating));
  }

  // In Stock filter
  if (inStock) {
    filtered = filtered.filter((b) => b.inventory > 0);
  }

  // Sorting
  if (sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating-desc') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'title-asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  const totalBooks = filtered.length;
  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(limit) || 12);
  const totalPages = Math.ceil(totalBooks / pageSize);
  const startIndex = (pageNum - 1) * pageSize;
  const pagedBooks = filtered.slice(startIndex, startIndex + pageSize);

  return {
    books: pagedBooks,
    totalBooks,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1,
  };
}
