import type { NotProvided } from './__internal/not-provided';

export interface Assertions<Received = NotProvided>
  extends AssertionsBuiltIn<Received> {}

export type AssertionsBuiltIn<Received = NotProvided> = {
  /**
   * Negates the result of a subsequent assertion.
   */
  not: Assertions<Received>;

  /**
   * Asserts that the received type is `any`.
   */
  toBeAny(): void;

  /**
   * Asserts that the received type is `unknown`.
   */
  toBeUnknown(): void;

  /**
   * Asserts that the received type is `never`.
   */
  toBeNever(): void;

  /**
   * Asserts that the received type is `void`.
   */
  toBeVoid(): void;

  /**
   * Asserts that the received type is `undefined`.
   */
  toBeUndefined(): void;

  /**
   * Asserts that the received type is `null`.
   */
  toBeNull(): void;

  /**
   * Asserts that the received type is a `string`.
   */
  toBeString(): void;

  /**
   * Asserts that the received type is a string literal type.
   */
  toBeStringLiteral(): void;

  /**
   * Asserts that the received type is a `number`.
   */
  toBeNumber(): void;

  /**
   * Asserts that the received type is a number literal type.
   */
  toBeNumberLiteral(): void;

  /**
   * Asserts that the received type is a `boolean`.
   */
  toBeBoolean(): void;

  /**
   * Asserts that the received type is a boolean literal type.
   */
  toBeBooleanLiteral(): void;

  /**
   * Asserts that the received type is a literal true type.
   */
  toBeTrue(): void;

  /**
   * Asserts that the received type is a literal false type.
   */
  toBeFalse(): void;

  /**
   * Asserts that the received type is an object type.
   */
  toBeObject(): void;

  /**
   * Asserts that the received type is an array type.
   */
  toBeArray(): void;

  /**
   * Asserts that the received type is a tuple type.
   */
  toBeTuple(): void;

  /**
   * Asserts that the received type is a function type.
   */
  toBeFunction(): void;

  /**
   * Asserts that the received type is a class.
   */
  toBeClass(): void;

  /**
   * Asserts that the received type is a union type.
   */
  toBeUnion(): void;

  /**
   * Asserts that the received type is an intersection type.
   */
  toBeIntersection(): void;

  /**
   * Asserts that the received type is exactly the same as the expected type.
   *
   * @template Expected The expected type to be compared with the received type.
   * @param expected The expected type from value (only the value type will be used).
   */
  toBe<Expected = NotProvided>(expected?: Expected): void;

  /**
   * Alias for `toBe`.
   */
  toEqual<Expected = NotProvided>(expected?: Expected): void;

  /**
   * Alias for `toBe`.
   */
  toStrictEqual<Expected = NotProvided>(expected?: Expected): void;

  /**
   * Asserts that the received type extends the expected type.
   *
   * @template Expected The expected supertype.
   * @param expected The expected type from value (only the value type will be used).
   */
  toExtends<Expected = NotProvided>(expected?: Expected): void;

  /**
   * Alias for `toExtends`.
   *
   * @template Expected The expected supertype.
   * @param expected The expected type from value (only the value type will be used).
   */
  toAssignable<Expected = NotProvided>(expected?: Expected): void;

  /**
   * Alias for `toExtends`.
   *
   * @template Expected The expected supertype.
   * @param expected The expected type from value (only the value type will be used).
   */
  toCompatible<Expected = NotProvided>(expected?: Expected): void;

  /**
   * Asserts mutual extension (bidirectional) between the received and expected types.
   *
   * @template Expected The expected type to mutually extend with the received type.
   * @param expected The expected type from value (only the value type will be used).
   */
  toExtendsMutually<Expected = NotProvided>(expected?: Expected): void;

  /**
   * Alias for `toExtendsMutually`.
   *
   * @template Expected The expected type to mutually extend with the received type.
   * @param expected The expected type from value (only the value type will be used).
   */
  toAssignableMutually<Expected = NotProvided>(expected?: Expected): void;

  /**
   * Alias for `toExtendsMutually`.
   *
   * @template Expected The expected type to mutually extend with the received type.
   * @param expected The expected type from value (only the value type will be used).
   */
  toMutual<Expected = NotProvided>(expected?: Expected): void;

  /**
   * Asserts that the received type and the expected type are related by extension
   *
   * @template Expected The expected type.
   * @param expected The expected type from value (only the value type will be used).
   */
  toExtendsEitherWay<Expected = NotProvided>(expected?: Expected): void;

  /**
   * Alias for `toExtendsEitherWay`.
   *
   * @template Expected The expected type.
   * @param expected The expected type from value (only the value type will be used).
   */
  toAssignableEitherWay<Expected = NotProvided>(expected?: Expected): void;

  /**
   * Alias for `toExtendsEitherWay`.
   *
   * @template Expected The expected type.
   * @param expected The expected type from value (only the value type will be used).
   */
  toRelate<Expected = NotProvided>(expected?: Expected): void;
};
