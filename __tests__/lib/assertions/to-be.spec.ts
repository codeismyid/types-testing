import { beforeEach, describe, expect, it } from 'bun:test';
import * as assertions from 'lib/assertions/to-be';
import ts from 'typescript';

const mockType = (
  flags: ts.TypeFlags,
  overrides: Partial<ts.Type> = {}
): ts.Type =>
  ({
    flags,
    isStringLiteral: () => false,
    isNumberLiteral: () => false,
    ...overrides
  }) as ts.Type;

describe('lib > assertions > to-be', () => {
  let checker: ts.TypeChecker;

  beforeEach(() => {
    checker = {} as ts.TypeChecker;
  });

  describe('toBeAny', () => {
    it('should return true for any type', () => {
      expect(assertions.toBeAny(checker, mockType(ts.TypeFlags.Any))).toBe(
        true
      );
    });

    it('should return false for non-any type', () => {
      expect(assertions.toBeAny(checker, mockType(ts.TypeFlags.String))).toBe(
        false
      );
    });
  });

  describe('toBeUnknown', () => {
    it('should return true for unknown type', () => {
      expect(
        assertions.toBeUnknown(checker, mockType(ts.TypeFlags.Unknown))
      ).toBe(true);
    });
  });

  describe('toBeNever', () => {
    it('should return true for never type', () => {
      expect(assertions.toBeNever(checker, mockType(ts.TypeFlags.Never))).toBe(
        true
      );
    });
  });

  describe('toBeVoid', () => {
    it('should return true for void type', () => {
      expect(assertions.toBeVoid(checker, mockType(ts.TypeFlags.Void))).toBe(
        true
      );
    });
  });

  describe('toBeUndefined', () => {
    it('should return true for undefined type', () => {
      expect(
        assertions.toBeUndefined(checker, mockType(ts.TypeFlags.Undefined))
      ).toBe(true);
    });
  });

  describe('toBeNull', () => {
    it('should return true for null type', () => {
      expect(assertions.toBeNull(checker, mockType(ts.TypeFlags.Null))).toBe(
        true
      );
    });
  });

  describe('toBeString', () => {
    it('should return true for string type', () => {
      expect(
        assertions.toBeString(checker, mockType(ts.TypeFlags.String))
      ).toBe(true);
    });

    it('should return true for string literal type', () => {
      const type = mockType(ts.TypeFlags.Unknown, {
        isStringLiteral: () => true
      } as ts.Type);
      expect(assertions.toBeString(checker, type)).toBe(true);
    });
  });

  describe('toBeStringLiteral', () => {
    it('should return true for string literal type', () => {
      const type = mockType(ts.TypeFlags.Unknown, {
        isStringLiteral: () => true
      } as ts.Type);
      expect(assertions.toBeStringLiteral(checker, type)).toBe(true);
    });
  });

  describe('toBeNumber', () => {
    it('should return true for number type', () => {
      expect(
        assertions.toBeNumber(checker, mockType(ts.TypeFlags.Number))
      ).toBe(true);
    });

    it('should return true for number literal type', () => {
      const type = mockType(ts.TypeFlags.Unknown, {
        isNumberLiteral: () => true
      } as ts.Type);
      expect(assertions.toBeNumber(checker, type)).toBe(true);
    });
  });

  describe('toBeNumberLiteral', () => {
    it('should return true for number literal type', () => {
      const type = mockType(ts.TypeFlags.Unknown, {
        isNumberLiteral: () => true
      } as ts.Type);
      expect(assertions.toBeNumberLiteral(checker, type)).toBe(true);
    });
  });

  describe('toBeBoolean', () => {
    it('should return true for boolean', () => {
      expect(
        assertions.toBeBoolean(checker, mockType(ts.TypeFlags.Boolean))
      ).toBe(true);
    });

    it('should return true for boolean literal type', () => {
      expect(
        assertions.toBeBoolean(checker, mockType(ts.TypeFlags.BooleanLiteral))
      ).toBe(true);
    });
  });

  describe('toBeBooleanLiteral', () => {
    it('should return true for boolean literal type', () => {
      expect(
        assertions.toBeBooleanLiteral(
          checker,
          mockType(ts.TypeFlags.BooleanLiteral)
        )
      ).toBe(true);
    });
  });

  describe('toBeTrue', () => {
    beforeEach(() => {
      checker.getTrueType = () =>
        mockType(ts.TypeFlags.BooleanLiteral, { intrinsicName: 'true' });
    });

    it('should return true for true type', () => {
      expect(
        assertions.toBeTrue(
          checker,
          mockType(ts.TypeFlags.BooleanLiteral, { intrinsicName: 'true' })
        )
      ).toBe(true);
    });
  });

  describe('toBeFalse', () => {
    beforeEach(() => {
      checker.getFalseType = () =>
        mockType(ts.TypeFlags.BooleanLiteral, { intrinsicName: 'false' });
    });

    it('should return true for false type', () => {
      expect(
        assertions.toBeFalse(
          checker,
          mockType(ts.TypeFlags.BooleanLiteral, { intrinsicName: 'false' })
        )
      ).toBe(true);
    });
  });

  describe('toBeObject', () => {
    it('should return true for object type', () => {
      expect(
        assertions.toBeObject(checker, mockType(ts.TypeFlags.Object))
      ).toBe(true);
    });
  });

  describe('toBeArray', () => {
    beforeEach(() => {
      checker.isArrayType = () => true;
      checker.isTupleType = () => true;
    });

    it('should return true for array type', () => {
      expect(assertions.toBeArray(checker, mockType(ts.TypeFlags.Object))).toBe(
        true
      );
    });
  });

  describe('toBeTuple', () => {
    beforeEach(() => {
      checker.isTupleType = () => true;
    });

    it('should return true for tuple type', () => {
      expect(assertions.toBeTuple(checker, mockType(ts.TypeFlags.Object))).toBe(
        true
      );
    });
  });

  describe('toBeFunction', () => {
    beforeEach(() => {
      checker.getSignaturesOfType = () => [{} as ts.Signature];
    });

    it('should return true for function type', () => {
      expect(
        assertions.toBeFunction(checker, mockType(ts.TypeFlags.Object))
      ).toBe(true);
    });
  });

  describe('toBeClass', () => {
    it('should return true for class type', () => {
      expect(
        assertions.toBeClass(
          checker,
          mockType(ts.TypeFlags.StructuredOrInstantiable, {
            isClass: () => true
          } as ts.Type)
        )
      ).toBe(true);
    });
  });

  describe('toBeUnion', () => {
    it('should return true for union type', () => {
      expect(
        assertions.toBeUnion(
          checker,
          mockType(ts.TypeFlags.Union, { isUnion: () => true } as ts.Type)
        )
      ).toBe(true);
    });
  });

  describe('toBeIntersection', () => {
    it('should return true for intersection type', () => {
      expect(
        assertions.toBeIntersection(
          checker,
          mockType(ts.TypeFlags.Intersection, {
            isIntersection: () => true
          } as ts.Type)
        )
      ).toBe(true);
    });
  });

  describe('toBe', () => {
    const typeA = mockType(ts.TypeFlags.String);
    const typeB = mockType(ts.TypeFlags.Number);
    const anyType = mockType(ts.TypeFlags.Any);

    beforeEach(() => {
      checker = {
        isTypeAssignableTo: (a: ts.Type, b: ts.Type) => a === b
      } as ts.TypeChecker;
    });

    it('should return true when types are equal', () => {
      expect(assertions.toBe(checker, typeA, typeA)).toBe(true);
    });

    it('should return false when types differ', () => {
      expect(assertions.toBe(checker, typeA, typeB)).toBe(false);
    });

    it('should return true if both are Any', () => {
      expect(assertions.toBe(checker, anyType, anyType)).toBe(true);
    });

    it('should return false if only one is Any', () => {
      expect(assertions.toBe(checker, anyType, typeA)).toBe(false);
      expect(assertions.toBe(checker, typeA, anyType)).toBe(false);
    });
  });

  describe('toEqual', () => {
    it('should be the same as toBe', () => {
      expect(assertions.toEqual).toStrictEqual(assertions.toBe);
    });
  });

  describe('toStrictEqual', () => {
    it('should be the same as toBe', () => {
      expect(assertions.toStrictEqual).toStrictEqual(assertions.toBe);
    });
  });
});
