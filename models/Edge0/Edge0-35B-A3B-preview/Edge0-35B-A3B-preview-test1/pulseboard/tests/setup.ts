import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, beforeEach, vi } from 'vitest';

// Clear localStorage between tests
beforeEach(() => {
  localStorage.clear();
  cleanup();
});

afterAll(() => {
  localStorage.clear();
});

// Mock crypto.randomUUID for tests
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2),
});
