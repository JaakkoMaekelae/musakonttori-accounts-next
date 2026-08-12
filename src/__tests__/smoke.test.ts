import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('math works', () => {
    expect(1 + 1).toBe(2);
  });

  it('environment is Node', () => {
    expect(typeof process).toBe('object');
  });
});
