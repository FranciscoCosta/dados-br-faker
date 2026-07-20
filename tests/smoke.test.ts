import { describe, expect, it } from 'vitest';
import { version } from '../src/index.js';

describe('foundation smoke test', () => {
  it('exposes a semver-shaped version string', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
