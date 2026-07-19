import { useEffect, useRef } from 'react';
import './CustomCursor.css';

const HOVER_SELECTOR =
  'a, button, input, textarea, select, label, [role="button"], .book-card, .shelf__spine, .genre-filter__chip';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const isTouchDevice =
      window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

    // Don't run any of the cursor logic on touch devices.
    if (isTouchDevice) return undefined;

    document.body.classList.add('custom-cursor-active');

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId = null;

    function moveDot() {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
    }

    function handleMouseMove(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      moveDot();

      // If the user prefers reduced motion, skip the smooth "lag" and
      // move the ring instantly along with the dot.
      if (prefersReducedMotion && ringRef.current) {
        ringRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
    }

    function animateRing() {
      // Smoothly "chase" the mouse position (simple linear interpolation).
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(animateRing);
    }

    function handleMouseDown() {
      ringRef.current?.classList.add('custom-cursor__ring--click');
    }

    function handleMouseUp() {
      ringRef.current?.classList.remove('custom-cursor__ring--click');
    }

    function handleMouseOver(event) {
      if (event.target.closest(HOVER_SELECTOR)) {
        ringRef.current?.classList.add('custom-cursor__ring--hover');
      }
    }

    function handleMouseOut(event) {
      if (event.target.closest(HOVER_SELECTOR)) {
        ringRef.current?.classList.remove('custom-cursor__ring--hover');
      }
    }

    function handleLeaveWindow() {
      dotRef.current?.classList.add('custom-cursor--hidden');
      ringRef.current?.classList.add('custom-cursor--hidden');
    }

    function handleEnterWindow() {
      dotRef.current?.classList.remove('custom-cursor--hidden');
      ringRef.current?.classList.remove('custom-cursor--hidden');
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseleave',