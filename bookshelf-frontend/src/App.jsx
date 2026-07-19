import { useMemo, useState } from 'react';
import CustomCursor from './components/CustomCursor.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import GenreFilter from './components/GenreFilter.jsx';
import BookCard from './components/BookCard.jsx';
import Footer from './components/Footer.jsx';
import { books, genres } from './data/books.js';
import './App.css';

export default function App() {
  const [activeGenre, setActiveGenre] = useState('All');
  const [cart, setCart] = useState([]);

  const visibleBooks = useMemo(() => {
    if (activeGenre === 'All') return books;
    return books.filter((book) => book.genre === activeGenre);
  }, [activeGenre]);

  function handleAddToCart(book) {
    setCart((prev) => [...prev, book]);
  }

  return (
    <div className="app">
      <CustomCursor />
      <Navbar cartCount={cart.length} onCartClick={() => {}} />
      <div className="nav-spacer" />
      <Hero />

      <main className="catalog" id="catalog">
        <div className="catalog__inner">
          <div className="catalog__header">
            <h2 className="catalog__title">Browse the catalog</h2>
            <p className="catalog__count">{visibleBooks.length} titles</p>
          </div>

          <GenreFilter genres={genres} active={activeGenre} onSelect={setActiveGenre} />

          <div className="catalog__grid">
            {visibleBooks.map((book) => (
              <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
