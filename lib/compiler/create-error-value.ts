import ts from 'typescript';
import type { CompileResultError } from './compile';

/** @internal */
export const createErrorValue = (
  sourceFile: ts.SourceFile,
  caller: ts.Node | ts.CallExpression | ts.MemberName,
  expectCallExpressionText?: string,
  assertionCallExpressionText?: string,
  receivedType?: string,
  expectedType?: string,
  isNegated?: boolean,
  need2TypeArguments?: boolean
): CompileResultError => {
  const position = sourceFile.getLineAndCharacterOfPosition(caller.getStart());
  const filePath = ts.sys.resolvePath(sourceFile.fileName);
  const line = position.line + 1;
  const column = position.character + 1;

  return {
    filePath,
    line,
    column,
    expectCallExpressionText,
    assertionCallExpressionText,
    receivedType,
    expectedType,
    isNegated,
    need2TypeArguments
  };
};
