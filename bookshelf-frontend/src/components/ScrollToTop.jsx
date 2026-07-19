import { useEffect, useState } from 'react';
import './ScrollToTop.css';

const SCROLL_THRESHOLD = 400;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    }

    // Check the initial scroll position (e.g. on page refresh mid-scroll).
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleClick() {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  return (
    <button
      type="button"
      className={`scroll-to-top ${visible ? 'scroll-to-top--visible' : ''}`}
      onClick={handleClick}
      aria-label="Scroll back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    ></button>