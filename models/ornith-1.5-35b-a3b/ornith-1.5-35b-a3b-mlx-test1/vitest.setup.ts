import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Reset the DOM (and React internals) after every test so state never leaks
// between tests, which is critical for persistence-related assertions.
afterEach(() => {
  cleanup();
});
