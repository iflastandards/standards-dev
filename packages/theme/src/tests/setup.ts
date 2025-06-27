import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Ensure DOM cleanup after each test
afterEach(() => {
  cleanup();
});