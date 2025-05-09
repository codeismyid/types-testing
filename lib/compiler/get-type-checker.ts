import { Assertion } from 'lib';
import { AssertionState } from 'src/definitions/__internal/assertions';
import ts from 'typescript';

/** @internal */
export const getTypeChecker = (program: ts.Program) => {
  const __cache = new WeakMap<WeakKey, unknown>();
  const checker = program.getTypeChecker() as TypeChecker;

  checker.__internal = {
    identifyTestCall(node) {
      let result: IdentifiedTestCall = null;

      if (!ts.isCallExpression(node)) {
        return result;
      }

      const props = checker.getTypeAtLocation(node).getProperties();

      if (props.length === 0) {
        return result;
      }

      if (__cache.has(props)) {
        return __cache.get(props) as IdentifiedTestCall;
      }

      const getTypeStringFromType = (type?: ts.Type) => {
        if (!type) {
          return null as unknown as string;
        }

        return checker.typeToString(
          type,
          undefined,
          ts.TypeFormatFlags.InTypeAlias |
            ts.TypeFormatFlags.NoTruncation |
            ts.TypeFormatFlags.UseFullyQualifiedType |
            ts.TypeFormatFlags.WriteTypeArgumentsOfSignature
        );
      };

      const getProcessedType = (type: ts.Type) => {
        const isNotProvided =
          type.getProperty('__typesTesting_notProvided') !== undefined;

        if (isNotProvided) {
          return;
        }

        return type;
      };

      for (const prop of props) {
        const name = checker.symbolToString(prop);

        if (name === '[__typesTesting_expectCall]') {
          const receivedType = getProcessedType(checker.getTypeOfSymbol(prop));
          result = {
            type: 'expect',
            props: {
              receivedType
            }
          };
          break;
        }

        if (name === '[__typesTesting_assertionCall]') {
          const propType = checker.getTypeOfSymbol(prop);
          const getTypeFromProp = (key: string) => {
            const innerProp = propType.getProperty(key);

            if (!innerProp) {
              return;
            }

            return checker.getTypeOfSymbol(innerProp);
          };

          const assertionName = getTypeFromProp('assertionName');

          if (assertionName?.value === undefined) {
            break;
          }

          const assertionFn = Assertion?.[assertionName.value as AssertionName];

          if (assertionFn === undefined) {
            break;
          }

          const assertionState = getTypeFromProp('assertionState');

          if (assertionState?.value === undefined) {
            break;
          }

          let receivedType = getTypeFromProp('receivedType');

          if (receivedType === undefined) {
            break;
          }

          let expectedType = getTypeFromProp('expectedType');

          if (expectedType === undefined) {
            break;
          }

          receivedType = getProcessedType(receivedType);
          expectedType = getProcessedType(expectedType);

          const receivedTypeString = getTypeStringFromType(receivedType);
          const expectedTypeString = getTypeStringFromType(expectedType);
          const needTypeArgument = assertionFn.needTypeArgument;
          const isNegated = assertionState.value === AssertionState.Negated;

          result = {
            type: 'assertion',
            props: {
              assertionFn,
              isNegated,
              receivedType,
              expectedType,
              receivedTypeString,
              expectedTypeString,
              needTypeArgument
            }
          };
        }
      }

      __cache.set(props, result);

      return result;
    },
    postIdentifyTestCall(node, forExpectCall) {
      if (forExpectCall) {
        const callerNode = node;
        const expectCallExpressionText = node.expression.getText();

        return {
          callerNode,
          expectCallExpressionText
        };
      }

      if (ts.isPropertyAccessExpression(node.expression)) {
        const callerNode = node.expression.name;
        const assertionCallExpressionText = node.expression.name.getText();
        const expectCallExpressionText = node.getFirstToken()?.getText();

        return {
          callerNode,
          assertionCallExpressionText,
          expectCallExpressionText
        };
      }

      const callerNode = node;
      const assertionCallExpressionText = node.expression.getText();

      return {
        callerNode,
        assertionCallExpressionText
      };
    }
  };

  return checker;
};

/** @internal */
export type TypeChecker = ts.TypeChecker & {
  /** @internal */
  __internal: {
    /** @internal */
    identifyTestCall(node: ts.Node): IdentifiedTestCall;
    /** @internal */
    postIdentifyTestCall(
      node: ts.CallExpression,
      forExpectCall: boolean
    ): {
      callerNode: ts.Node | ts.LeftHandSideExpression;
      assertionCallExpressionText?: string;
      expectCallExpressionText?: string;
    };
  };
};
/** @internal */
export type AssertionName = keyof typeof Assertion;

/** @internal */
export type AssertionFn = (typeof Assertion)[AssertionName];

type AssertionCallProps = {
  assertionFn: AssertionFn;
  receivedType?: ts.Type;
  expectedType?: ts.Type;
  receivedTypeString?: string;
  expectedTypeString?: string;
  isNegated: boolean;
  needTypeArgument: boolean;
};

type ExpectCallProps = {
  receivedType?: ts.Type;
  expectedType?: never;
  isNegated?: never;
  needTypeArgument?: never;
};

type IdentifiedTestCall =
  | null
  | {
      type: 'assertion';
      props: AssertionCallProps;
    }
  | {
      type: 'expect';
      props: ExpectCallProps;
    };
