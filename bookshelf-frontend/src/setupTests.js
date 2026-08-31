import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Provide global jest shim for tests that use jest.fn()
if (typeof globalThis.jest === 'undefined') {
  globalThis.jest = {
    fn: (...args) => vi.fn(...args),
    spyOn: (...args) => vi.spyOn(...args),
    clearAllMocks: () => vi.clearAllMocks(),
    resetAllMocks: () => vi.resetAllMocks(),
  };
}

// Stub Element.prototype.scrollIntoView if missing in jsdom
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = function () {};
}

