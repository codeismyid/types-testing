import { beforeEach, describe, expect, it } from 'bun:test';
import * as assertions from 'lib/assertions/to-extends';
import ts from 'typescript';

const mockType = (flags: ts.TypeFlags): ts.Type =>
  ({
    flags
  }) as ts.Type;

describe('lib > assertions > to-extends', () => {
  let checker: ts.TypeChecker;

  beforeEach(() => {
    checker = {
      isTypeAssignableTo: (a: ts.Type, b: ts.Type) =>
        a === b || (a.flags & b.flags) !== 0
    } as ts.TypeChecker;
  });

  describe('toExtends', () => {
    it('should return true if received is assignable to expected', () => {
      const received = mockType(ts.TypeFlags.String);
      const expected = mockType(ts.TypeFlags.String);
      expect(assertions.toExtends(checker, received, expected)).toBe(true);
    });

    it('should return false if received is not assignable to expected', () => {
      const received = mockType(ts.TypeFlags.String);
      const expected = mockType(ts.TypeFlags.Number);
      expect(assertions.toExtends(checker, received, expected)).toBe(false);
    });
  });

  describe('toAssignable', () => {
    it('should be the same as toExtends', () => {
      expect(assertions.toAssignable).toStrictEqual(assertions.toExtends);
    });
  });

  describe('toCompatible', () => {
    it('should be the same as toExtends', () => {
      expect(assertions.toCompatible).toStrictEqual(assertions.toExtends);
    });
  });

  describe('toExtendsMutually', () => {
    it('should return true if both types are assignable to each other', () => {
      const type = mockType(ts.TypeFlags.String);
      expect(assertions.toExtendsMutually(checker, type, type)).toBe(true);
    });

    it('should return false if only one direction is assignable', () => {
      const received = mockType(ts.TypeFlags.String);
      const expected = mockType(ts.TypeFlags.Number);
      expect(assertions.toExtendsMutually(checker, received, expected)).toBe(
        false
      );
    });
  });

  describe('toAssignableMutually', () => {
    it('should be the same as toExtendsMutually', () => {
      expect(assertions.toAssignableMutually).toStrictEqual(
        assertions.toExtendsMutually
      );
    });
  });

  describe('toMutual', () => {
    it('should be the same as toExtendsMutually', () => {
      expect(assertions.toMutual).toStrictEqual(assertions.toExtendsMutually);
    });
  });

  describe('toExtendsEitherWay', () => {
    it('should return true if either type is assignable to the other', () => {
      const a = mockType(ts.TypeFlags.String);
      const b = mockType(ts.TypeFlags.String | ts.TypeFlags.Number);
      expect(assertions.toExtendsEitherWay(checker, a, b)).toBe(true);
    });

    it('should return false if neither type is assignable to the other', () => {
      const a = mockType(ts.TypeFlags.String);
      const b = mockType(ts.TypeFlags.Number);
      expect(assertions.toExtendsEitherWay(checker, a, b)).toBe(false);
    });
  });

  describe('toAssignableEitherWay', () => {
    it('should be the same as toExtendsEitherWay', () => {
      expect(assertions.toAssignableEitherWay).toStrictEqual(
        assertions.toExtendsEitherWay
      );
    });
  });

  describe('toRelate', () => {
    it('should be the same as toExtendsEitherWay', () => {
      expect(assertions.toRelate).toStrictEqual(assertions.toExtendsEitherWay);
    });
  });
});
