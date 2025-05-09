import type ts from 'typescript';
import { createErrorKey } from './create-error-key';
import { createErrorValue } from './create-error-value';
import { createProgram } from './create-program';
import { getTypeChecker } from './get-type-checker';
import { traverseSourceFile } from './traverse-source-file';
import { validateAssertion } from './validate-assertion';

declare module 'typescript' {
  interface Type {
    intrinsicName?: string;
    value?: unknown;
  }
}

/** @internal */
export const compile = (options: CompileOptions) => {
  const program = createProgram(options);
  const config = program.__internal;
  const checker = getTypeChecker(program);
  const { identifyTestCall, postIdentifyTestCall } = checker.__internal;
  const setErrorValue = (...args: Parameters<typeof createErrorValue>) => {
    const value = createErrorValue(...args);
    const key = createErrorKey(value.filePath, value.line, value.column);
    result.errors.set(key, value);
  };

  const result: CompileResult = {
    files: config.files,
    options: config.options,
    errors: new Map<string, CompileResultError>()
  };

  for (const fileName of config.files) {
    const sourceFile = program.getSourceFile(fileName);

    if (!sourceFile) {
      continue;
    }

    traverseSourceFile(sourceFile, (node) => {
      const testCall = identifyTestCall(node);

      if (testCall === null) {
        return;
      }

      if (testCall.type === 'expect') {
        if (testCall.props.receivedType === undefined) {
          const { callerNode, expectCallExpressionText } = postIdentifyTestCall(
            node as ts.CallExpression,
            true
          );
          setErrorValue(sourceFile, callerNode, expectCallExpressionText);
        }

        return;
      }

      if (testCall.type === 'assertion') {
        if (testCall.props.receivedType === undefined) {
          const { callerNode, expectCallExpressionText } = postIdentifyTestCall(
            node as ts.CallExpression,
            false
          );
          setErrorValue(sourceFile, callerNode, expectCallExpressionText);
          return;
        }

        const isValidAssertion = validateAssertion(testCall.props.assertionFn, {
          checker,
          receivedType: testCall.props.receivedType,
          expectedType: testCall.props.expectedType,
          isNegated: testCall.props.isNegated
        });
        if (!isValidAssertion) {
          const {
            callerNode,
            expectCallExpressionText,
            assertionCallExpressionText
          } = postIdentifyTestCall(node as ts.CallExpression, false);

          setErrorValue(
            sourceFile,
            callerNode,
            expectCallExpressionText,
            assertionCallExpressionText,
            testCall.props.receivedTypeString,
            testCall.props.expectedTypeString,
            testCall.props.isNegated,
            testCall.props.needTypeArgument
          );
        }
      }
    });
  }

  return result;
};

/** @internal */
export type CompileResultError = {
  filePath: string;
  line: number;
  column: number;
  expectCallExpressionText?: string;
  assertionCallExpressionText?: string;
  receivedType?: string;
  expectedType?: string;
  isNegated?: boolean;
  need2TypeArguments?: boolean;
};

/** @internal */
export type CompileResult = {
  files: readonly string[];
  options: ts.CompilerOptions;
  errors: Map<string, CompileResultError>;
};

/** @internal */
export type CompileOptions =
  | {
      basePath: string;
      tsConfig: string;
      compilerOptions?: Partial<ts.CompilerOptions>;
      files?: readonly string[];
      projectReferences?: readonly ts.ProjectReference[];
    }
  | {
      basePath?: string;
      tsConfig?: string;
      compilerOptions: Partial<ts.CompilerOptions>;
      files: readonly string[];
      projectReferences?: readonly ts.ProjectReference[];
    };

export type Compile = typeof compile;
