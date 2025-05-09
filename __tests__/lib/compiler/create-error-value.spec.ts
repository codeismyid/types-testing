import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  spyOn
} from 'bun:test';
import { createErrorValue } from 'lib/compiler/create-error-value';
import ts from 'typescript';

describe('lib > compiler > create-error-value', () => {
  let resolvePath: JestMock.Spied<typeof ts.sys.resolvePath>;
  let sourceFile: ts.SourceFile;
  let caller: ts.Node;

  beforeEach(() => {
    caller = {
      getStart: jest.fn(() => 0)
    } as unknown as typeof caller;
    sourceFile = {
      fileName: 'src/index.ts',
      getLineAndCharacterOfPosition: jest.fn((pos: number) => ({
        line: pos,
        character: pos
      }))
    } as unknown as typeof sourceFile;
    resolvePath = spyOn(ts.sys, 'resolvePath').mockImplementation(
      (path) => path
    );
  });

  afterEach(() => {
    resolvePath.mockRestore();
  });

  it('should call caller.getStart correctly', () => {
    createErrorValue(sourceFile, caller);
    expect(caller.getStart).toHaveBeenCalledTimes(1);
  });

  it('should call source.getLineAndCharacterOfPosition correctly', () => {
    createErrorValue(sourceFile, caller);
    expect(sourceFile.getLineAndCharacterOfPosition).toHaveBeenCalledTimes(1);
    expect(sourceFile.getLineAndCharacterOfPosition).toHaveBeenLastCalledWith(
      caller.getStart()
    );
  });

  it('should call ts.sys.resolvePath correctly', () => {
    createErrorValue(sourceFile, caller);
    expect(resolvePath).toHaveBeenCalledTimes(1);
    expect(resolvePath).toHaveBeenLastCalledWith(sourceFile.fileName);
  });

  it('should handle returned value correctly', () => {
    const line = caller.getStart() + 1;
    const column = caller.getStart() + 1;
    const expectCallExpressionText = '';
    const assertionCallExpressionText = '';
    const receivedType = '';
    const expectedType = '';
    const isNegated = false;
    const need2TypeArguments = false;

    const result = createErrorValue(
      sourceFile,
      caller,
      expectCallExpressionText,
      assertionCallExpressionText,
      receivedType,
      expectedType,
      isNegated,
      need2TypeArguments
    );

    expect(result).toEqual({
      filePath: sourceFile.fileName,
      line,
      column,
      expectCallExpressionText,
      assertionCallExpressionText,
      receivedType,
      expectedType,
      isNegated,
      need2TypeArguments
    });
  });
});
