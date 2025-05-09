import { beforeEach, describe, expect, it, jest } from 'bun:test';
import type { AssertionFn } from 'lib/compiler';
import {
  type ValidateAssertionParams,
  validateAssertion
} from 'lib/compiler/validate-assertion';

describe('lib > compiler > validate-assertion', () => {
  let assertionFn: jest.Mock<AssertionFn>;
  let params: ValidateAssertionParams;

  beforeEach(() => {
    assertionFn = jest.fn();
    params = {
      checker: {},
      receivedType: {},
      expectedType: {},
      isNegated: false
    } as ValidateAssertionParams;
  });

  it('should call passed fn correctly', () => {
    validateAssertion(assertionFn as unknown as AssertionFn, params);

    expect(assertionFn).toHaveBeenCalledTimes(1);
    expect(assertionFn).toHaveBeenCalledWith(
      params.checker,
      params.receivedType,
      params.expectedType
    );
  });

  it('should return negated if `isNegated` is true', () => {
    assertionFn.mockReturnValue(true);
    params.isNegated = true;
    expect(
      validateAssertion(assertionFn as unknown as AssertionFn, params)
    ).toBe(false);
  });

  it('should return normally if `isNegated` is false', () => {
    assertionFn.mockReturnValue(true);
    params.isNegated = false;
    expect(
      validateAssertion(assertionFn as unknown as AssertionFn, params)
    ).toBe(true);
  });
});
