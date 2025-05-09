import { Factory } from 'lib';

/** @internal */
export const toExtends = Factory.assertionWithTypeArgument(
  (checker, received, expected) => {
    return checker.isTypeAssignableTo(received, expected);
  }
);

/** @internal */
export const toAssignable = toExtends;

/** @internal */
export const toCompatible = toExtends;

/** @internal */
export const toExtendsMutually = Factory.assertionWithTypeArgument(
  (checker, received, expected) => {
    return (
      checker.isTypeAssignableTo(received, expected) &&
      checker.isTypeAssignableTo(expected, received)
    );
  }
);

/** @internal */
export const toAssignableMutually = toExtendsMutually;

/** @internal */
export const toMutual = toExtendsMutually;

/** @internal */
export const toExtendsEitherWay = Factory.assertionWithTypeArgument(
  (checker, received, expected) => {
    return (
      checker.isTypeAssignableTo(received, expected) ||
      checker.isTypeAssignableTo(expected, received)
    );
  }
);

/** @internal */
export const toAssignableEitherWay = toExtendsEitherWay;

/** @internal */
export const toRelate = toExtendsEitherWay;
