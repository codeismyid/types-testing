import type ts from 'typescript';
import type { AssertionFn } from './get-type-checker';

/** @internal */
export type ValidateAssertionParams = {
  checker: ts.TypeChecker;
  receivedType: ts.Type;
  expectedType?: ts.Type;
  isNegated: boolean;
};

/** @internal */
export const validateAssertion = (
  assertionFn: AssertionFn,
  params: ValidateAssertionParams
) => {
  const result = assertionFn(
    params.checker,
    params.receivedType,
    params.expectedType as ts.Type
  );

  return params.isNegated ? !result : result;
};
