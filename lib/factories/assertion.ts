import type ts from 'typescript';

/** @internal */
export const assertionWithTypeArgument = <
  Fn extends (
    checker: ts.TypeChecker,
    received: ts.Type,
    expected: ts.Type
  ) => boolean
>(
  fn: Fn
) => {
  const _fn = fn as Fn & { needTypeArgument: true };
  _fn.needTypeArgument = true;
  return _fn;
};

/** @internal */
export const assertionWithoutTypeArgument = <
  Fn extends (checker: ts.TypeChecker, received: ts.Type) => boolean
>(
  fn: Fn
) => {
  const _fn = fn as Fn & { needTypeArgument: false };
  _fn.needTypeArgument = false;
  return _fn;
};
