import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  mock
} from 'bun:test';
import { traverseSourceFile } from 'lib/compiler/traverse-source-file';
import ts from 'typescript';

const mockSourceFile = {} as unknown as ts.SourceFile;
const mockChildNode = {} as unknown as ts.Node;

describe('lib > compiler > traverse-source-file', () => {
  let callback: (node: ts.Node) => void;

  beforeEach(() => {
    callback = jest.fn();
    mock.module('typescript', () => {
      return {
        default: {
          ...ts,
          forEachChild: jest.fn(() => {
            callback(mockChildNode);
          }) as typeof ts.forEachChild
        }
      };
    });
  });

  afterEach(() => {
    mock.module('typescript', () => {
      return {
        default: ts
      };
    });
  });

  it('should traverse all nodes in the source file and call the callback correctly', () => {
    traverseSourceFile(mockSourceFile, callback);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(mockSourceFile);
    expect(callback).toHaveBeenCalledWith(mockChildNode);
    expect(ts.forEachChild).toHaveBeenCalled();
  });
});
