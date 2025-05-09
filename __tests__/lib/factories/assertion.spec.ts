import { describe, expect, it, jest } from 'bun:test';
import {
  assertionWithTypeArgument,
  assertionWithoutTypeArgument
} from 'lib/factories/assertion';

describe('lib > factories > assertion', () => {
  const fn = jest.fn();
  describe('assertionWithTypeArgument', () => {
    it('should set needTypeArgument to true', () => {
      const wrapped = assertionWithTypeArgument(fn);
      expect(wrapped.needTypeArgument).toBe(true);
    });
  });

  describe('assertionWithoutTypeArgument', () => {
    it('should set needTypeArgument to false', () => {
      const wrapped = assertionWithoutTypeArgument(fn);
      expect(wrapped.needTypeArgument).toBe(false);
    });
  });
});
