import { describe, expect, it } from 'bun:test';
import { createErrorKey } from 'lib/compiler/create-error-key';

describe('lib > compiler > create-error-key', () => {
  describe('createErrorKey', () => {
    it('should create a correct error key based on filePath, line, and column', () => {
      const filePath = 'src/index.ts';
      const line = 10;
      const column = 20;
      const expected = 'src/index.ts:10:20';
      expect(createErrorKey(filePath, line, column)).toBe(expected);
    });

    it('should create an error key even with single digit line and column', () => {
      const filePath = 'src/app.ts';
      const line = 1;
      const column = 1;
      const expected = 'src/app.ts:1:1';
      expect(createErrorKey(filePath, line, column)).toBe(expected);
    });

    it('should handle filePath with spaces', () => {
      const filePath = 'src/my file.ts';
      const line = 5;
      const column = 15;
      const expected = 'src/my file.ts:5:15';
      expect(createErrorKey(filePath, line, column)).toBe(expected);
    });
  });
});
