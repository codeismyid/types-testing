import { Factory } from 'lib';
import ts from 'typescript';

/** @internal */
export const toBeAny = Factory.assertionWithoutTypeArgument((_, received) => {
  return (received.flags & ts.TypeFlags.Any) !== 0;
});

/** @internal */
export const toBeUnknown = Factory.assertionWithoutTypeArgument(
  (_, received) => {
    return (received.flags & ts.TypeFlags.Unknown) !== 0;
  }
);

/** @internal */
export const toBeNever = Factory.assertionWithoutTypeArgument((_, received) => {
  return (received.flags & ts.TypeFlags.Never) !== 0;
});

/** @internal */
export const toBeVoid = Factory.assertionWithoutTypeArgument((_, received) => {
  return (received.flags & ts.TypeFlags.Void) !== 0;
});

/** @internal */
export const toBeUndefined = Factory.assertionWithoutTypeArgument(
  (_, received) => {
    return (received.flags & ts.TypeFlags.Undefined) !== 0;
  }
);

/** @internal */
export const toBeNull = Factory.assertionWithoutTypeArgument((_, received) => {
  return (received.flags & ts.TypeFlags.Null) !== 0;
});

/** @internal */
export const toBeString = Factory.assertionWithoutTypeArgument(
  (_, received) => {
    return (
      (received.flags & ts.TypeFlags.String) !== 0 || received.isStringLiteral()
    );
  }
);

/** @internal */
export const toBeStringLiteral = Factory.assertionWithoutTypeArgument(
  (_, received) => {
    return received.isStringLiteral();
  }
);

/** @internal */
export const toBeNumber = Factory.assertionWithoutTypeArgument(
  (_, received) => {
    return (
      (received.flags & ts.TypeFlags.Number) !== 0 || received.isNumberLiteral()
    );
  }
);

/** @internal */
export const toBeNumberLiteral = Factory.assertionWithoutTypeArgument(
  (_, received) => {
    return received.isNumberLiteral();
  }
);

/** @internal */
export const toBeBoolean = Factory.assertionWithoutTypeArgument(
  (_, received) => {
    const flags = ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral;
    return (received.flags & flags) !== 0;
  }
);

/** @internal */
export const toBeBooleanLiteral = Factory.assertionWithoutTypeArgument(
  (_, received) => {
    return (received.flags & ts.TypeFlags.BooleanLiteral) !== 0;
  }
);

/** @internal */
export const toBeTrue = Factory.assertionWithoutTypeArgument(
  (checker, received) => {
    return (
      received === checker.getTrueType() ||
      ((received.flags & ts.TypeFlags.BooleanLiteral) !== 0 &&
        received.intrinsicName === 'true')
    );
  }
);

/** @internal */
export const toBeFalse = Factory.assertionWithoutTypeArgument(
  (checker, received) => {
    return (
      received === checker.getFalseType() ||
      ((received.flags & ts.TypeFlags.BooleanLiteral) !== 0 &&
        received.intrinsicName === 'false')
    );
  }
);

/** @internal */
export const toBeObject = Factory.assertionWithoutTypeArgument(
  (_, received) => {
    return (received.flags & ts.TypeFlags.Object) !== 0;
  }
);

/** @internal */
export const toBeArray = Factory.assertionWithoutTypeArgument(
  (checker, received) => {
    return checker.isArrayType(received) || checker.isTupleType(received);
  }
);

/** @internal */
export const toBeTuple = Factory.assertionWithoutTypeArgument(
  (checker, received) => {
    return checker.isTupleType(received);
  }
);

/** @internal */
export const toBeFunction = Factory.assertionWithoutTypeArgument(
  (checker, received) => {
    const callSignatures = checker.getSignaturesOfType(
      received,
      ts.SignatureKind.Call
    );
    return callSignatures.length > 0;
  }
);

/** @internal */
export const toBeClass = Factory.assertionWithoutTypeArgument((_, received) => {
  return received.isClass();
});

/** @internal */
export const toBeUnion = Factory.assertionWithoutTypeArgument((_, received) => {
  return received.isUnion();
});

/** @internal */
export const toBeIntersection = Factory.assertionWithoutTypeArgument(
  (_, received) => {
    return received.isIntersection();
  }
);

/** @internal */
export const toBe = Factory.assertionWithTypeArgument(
  (checker, received, expected) => {
    const isAny = {
      received: toBeAny(checker, received),
      expected: toBeAny(checker, expected)
    };

    if (isAny.received && isAny.expected) {
      return true;
    }

    if (isAny.received || isAny.expected) {
      return false;
    }

    return (
      checker.isTypeAssignableTo(received, expected) &&
      checker.isTypeAssignableTo(expected, received)
    );
  }
);

/** @internal */
export const toEqual = toBe;

/** @internal */
export const toStrictEqual = toBe;
