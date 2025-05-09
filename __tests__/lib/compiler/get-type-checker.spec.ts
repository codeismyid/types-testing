import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  mock
} from 'bun:test';
import { Assertion } from 'lib';
import { getTypeChecker } from 'lib/compiler/get-type-checker';
import { AssertionState } from 'src/definitions/__internal/assertions';
import ts from 'typescript';

describe('lib > compiler > get-type-checker', () => {
  let node: ts.CallExpression;
  let program: ts.Program;
  let tsChecker: ts.TypeChecker;
  let checker: ReturnType<typeof getTypeChecker>;

  beforeEach(() => {
    mock.module('typescript', () => {
      return {
        default: {
          ...ts,
          isCallExpression: jest
            .fn<typeof ts.isCallExpression>()
            .mockReturnValue(true),
          isPropertyAccessExpression: jest
            .fn<typeof ts.isCallExpression>()
            .mockReturnValue(true)
        }
      };
    });

    node = {} as unknown as typeof node;
    tsChecker = {
      getTypeAtLocation: jest.fn(),
      getTypeOfSymbol: jest.fn(),
      symbolToString: jest.fn(),
      typeToString: jest.fn(
        (type: ts.Type & { name: string }) => type?.name ?? ''
      )
    } as unknown as ts.TypeChecker;
    program = {
      getTypeChecker: () => tsChecker
    } as unknown as ts.Program;
    checker = getTypeChecker(program);
  });

  afterEach(() => {
    mock.module('typescript', () => {
      return {
        default: ts
      };
    });
  });

  describe('__internal > identifyTestCall', () => {
    let props: ts.Symbol[];
    let symbolName:
      | 'others'
      | '[__typesTesting_expectCall]'
      | '[__typesTesting_assertionCall]';

    beforeEach(() => {
      props = [];
      symbolName = 'others';
      (tsChecker.getTypeAtLocation as jest.Mock).mockReturnValue({
        getProperties: () => props
      });
      (tsChecker.symbolToString as jest.Mock).mockImplementation(
        () => symbolName
      );
    });

    it('should return null if node is not CallExpression', () => {
      (ts.isCallExpression as unknown as jest.Mock).mockReturnValueOnce(false);
      expect(checker.__internal.identifyTestCall(node)).toBe(null);
    });

    it('should return null if node type have 0 props', () => {
      props = [];
      expect(checker.__internal.identifyTestCall(node)).toBe(null);
    });

    it('should return null if does not have known props', () => {
      props = [{}] as typeof props;
      symbolName = 'others';
      expect(checker.__internal.identifyTestCall(node)).toBe(null);
    });

    it('should return from cache', () => {
      props = [{}] as typeof props;
      symbolName = 'others';
      expect(checker.__internal.identifyTestCall(node)).toBe(null);
      expect(tsChecker.symbolToString).toHaveBeenCalledTimes(1);

      for (let i = 0; i < 100; i++) {
        checker.__internal.identifyTestCall(node);
      }
      expect(tsChecker.symbolToString).toHaveBeenCalledTimes(1);
    });

    describe('expect call', () => {
      let isNotProvided: boolean;
      let receivedType: ts.Type;

      beforeEach(() => {
        props = [{}] as typeof props;
        symbolName = '[__typesTesting_expectCall]';
        isNotProvided = false;
        receivedType = {
          getProperty: () => isNotProvided || undefined
        } as unknown as typeof receivedType;
        (tsChecker.getTypeOfSymbol as jest.Mock).mockReturnValue(receivedType);
      });

      it('should return type correctly', () => {
        expect(checker.__internal.identifyTestCall(node)?.type).toBe('expect');
      });

      it('should return props correctly if receivedType is provided', () => {
        expect(checker.__internal.identifyTestCall(node)?.props).toEqual({
          receivedType
        });
      });

      it('should return props correctly if receivedType is not provided', () => {
        isNotProvided = true;
        expect(checker.__internal.identifyTestCall(node)?.props).toEqual({
          receivedType: undefined
        });
      });
    });

    describe('assertion call', () => {
      let propType: ts.Type;
      let innerType: {
        assertionName?: ts.Type;
        assertionState?: ts.Type;
        receivedType?: ts.Type;
        expectedType?: ts.Type;
      };

      beforeEach(() => {
        props = [{}] as typeof props;
        innerType = {
          assertionName: { value: 'toBe' },
          assertionState: { value: AssertionState.Normal },
          receivedType: { getProperty: jest.fn() },
          expectedType: { getProperty: jest.fn() }
        } as unknown as typeof innerType;
        propType = {
          getProperty: (key: keyof typeof innerType) => {
            const type = innerType[key];
            (tsChecker.getTypeOfSymbol as jest.Mock).mockReturnValueOnce(type);
            return type;
          }
        } as typeof propType;
        symbolName = '[__typesTesting_assertionCall]';
        (tsChecker.getTypeOfSymbol as jest.Mock).mockReturnValue(propType);
      });

      it('should return null if assertionName is undefined', () => {
        innerType.assertionName = undefined;
        const result = checker.__internal.identifyTestCall(node);
        expect(result).toBe(null);
      });

      it('should return null if assertionFn is undefined', () => {
        innerType.assertionName = { value: 'unknownFn' } as ts.Type;
        const result = checker.__internal.identifyTestCall(node);
        expect(result).toBe(null);
      });

      it('should return null if assertionState is undefined', () => {
        innerType.assertionState = undefined;
        const result = checker.__internal.identifyTestCall(node);
        expect(result).toBe(null);
      });

      it('should return null if receivedType is undefined', () => {
        innerType.receivedType = undefined;
        const result = checker.__internal.identifyTestCall(node);
        expect(result).toBe(null);
      });

      it('should return null if expectedType is undefined', () => {
        innerType.expectedType = undefined;
        const result = checker.__internal.identifyTestCall(node);
        expect(result).toBe(null);
      });

      it('should return undefined receivedType if its NotProvided', () => {
        (innerType.receivedType?.getProperty as jest.Mock).mockReturnValueOnce(
          true
        );
        const result = checker.__internal.identifyTestCall(node);
        expect(result?.props.receivedType).toBeUndefined();
      });

      it('should return undefined expectedType if its NotProvided', () => {
        (innerType.expectedType?.getProperty as jest.Mock).mockReturnValueOnce(
          true
        );
        const result = checker.__internal.identifyTestCall(node);
        expect(result?.props.expectedType).toBeUndefined();
      });

      it('should return true `isNegated` if assertionState.value is Negated', () => {
        (innerType.assertionState as ts.Type).value = AssertionState.Negated;
        const result = checker.__internal.identifyTestCall(node);
        expect(result?.props.isNegated).toBe(true);
      });

      it('should call checker.typeToString correctly', () => {
        checker.__internal.identifyTestCall(node);
        expect(tsChecker.typeToString).toHaveBeenCalledTimes(2);
        expect(tsChecker.typeToString).toHaveBeenCalledWith(
          innerType.receivedType,
          undefined,
          ts.TypeFormatFlags.InTypeAlias |
            ts.TypeFormatFlags.NoTruncation |
            ts.TypeFormatFlags.UseFullyQualifiedType |
            ts.TypeFormatFlags.WriteTypeArgumentsOfSignature
        );
        expect(tsChecker.typeToString).toHaveBeenCalledWith(
          innerType.expectedType,
          undefined,
          ts.TypeFormatFlags.InTypeAlias |
            ts.TypeFormatFlags.NoTruncation |
            ts.TypeFormatFlags.UseFullyQualifiedType |
            ts.TypeFormatFlags.WriteTypeArgumentsOfSignature
        );
      });

      it('should return correctly', () => {
        const assertionFn =
          Assertion[innerType.assertionName?.value as keyof typeof Assertion];
        expect(checker.__internal.identifyTestCall(node)).toEqual({
          type: 'assertion',
          props: {
            assertionFn,
            receivedType: innerType.receivedType,
            expectedType: innerType.expectedType,
            receivedTypeString: '',
            expectedTypeString: '',
            isNegated: false,
            needTypeArgument: assertionFn.needTypeArgument
          }
        });
      });
    });
  });

  describe('__internal > postIdentifyTestCall', () => {
    describe('for expect call', () => {
      beforeEach(() => {
        node = {
          expression: {
            getText: jest.fn()
          }
        } as unknown as typeof node;
      });

      it('should return correctly', () => {
        expect(checker.__internal.postIdentifyTestCall(node, true)).toEqual({
          callerNode: node,
          expectCallExpressionText: node.expression.getText(),
          assertionCallExpressionText: undefined
        });
      });
    });

    describe('for assertion call', () => {
      describe('node.expression is PropertyAccessExpression', () => {
        let nodeExpression: ts.PropertyAccessExpression;

        beforeEach(() => {
          (
            ts.isPropertyAccessExpression as unknown as jest.Mock
          ).mockReturnValue(true);
          nodeExpression = {
            name: {
              getText: jest.fn()
            }
          } as unknown as typeof nodeExpression;
          node = {
            getFirstToken: jest.fn(() => ({ getText: jest.fn() })),
            expression: nodeExpression
          } as unknown as typeof node;
        });

        it('should return correctly', () => {
          expect(checker.__internal.postIdentifyTestCall(node, false)).toEqual({
            callerNode: nodeExpression.name,
            assertionCallExpressionText: nodeExpression.name.getText(),
            expectCallExpressionText: node.getFirstToken()?.getText()
          });
          expect(ts.isPropertyAccessExpression).toHaveBeenCalledTimes(1);
          expect(ts.isPropertyAccessExpression).toHaveBeenCalledWith(
            nodeExpression
          );
        });
      });

      describe('node.expression is not PropertyAccessExpression', () => {
        beforeEach(() => {
          (
            ts.isPropertyAccessExpression as unknown as jest.Mock
          ).mockReturnValue(false);
          node = {
            expression: {
              getText: jest.fn()
            }
          } as unknown as typeof node;
        });

        it('should return correctly', () => {
          expect(checker.__internal.postIdentifyTestCall(node, false)).toEqual({
            callerNode: node,
            expectCallExpressionText: node.expression.getText(),
            assertionCallExpressionText: undefined
          });
        });
      });
    });
  });
});
