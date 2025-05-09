import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  mock
} from 'bun:test';
import type { Compiler } from 'lib';
import { createProgram } from 'lib/compiler/create-program';
import ts from 'typescript';

describe('lib > compiler > create-program', () => {
  let fileNames: readonly string[];
  let compilerOptions: ts.CompilerOptions;
  let projectReferences: readonly ts.ProjectReference[];
  let optionsDiagnostics: readonly ts.Diagnostic[];

  let readConfigFileMock: jest.Mock;
  let parseJsonConfigFileContentMock: jest.Mock;
  let createProgramMock: jest.Mock;
  let resolvePathMock: jest.Mock;
  let readFileMock: jest.Mock;

  beforeEach(() => {
    fileNames = ['file1.ts', 'file2.ts'];
    compilerOptions = { module: ts.ModuleKind.ESNext };
    projectReferences = [];
    optionsDiagnostics = [];

    readConfigFileMock = jest.fn(() => ({ config: {}, error: undefined }));
    parseJsonConfigFileContentMock = jest.fn(() => ({
      fileNames,
      options: compilerOptions,
      projectReferences,
      errors: []
    }));
    createProgramMock = jest.fn(() => ({
      getRootFileNames: () => fileNames,
      getCompilerOptions: () => compilerOptions,
      getProjectReferences: () => projectReferences,
      getOptionsDiagnostics: () => optionsDiagnostics
    }));
    resolvePathMock = jest.fn(() => 'tsconfig.json');
    readFileMock = jest.fn(() => '');

    mock.module('typescript', () => ({
      default: {
        ...ts,
        readConfigFile: readConfigFileMock,
        parseJsonConfigFileContent: parseJsonConfigFileContentMock,
        createProgram: createProgramMock,
        sys: {
          ...ts.sys,
          resolvePath: resolvePathMock,
          readFile: readFileMock
        }
      }
    }));
  });

  afterEach(() => {
    mock.restore();
  });

  describe('with tsconfig file', () => {
    it('should return correct config when tsConfig is valid', () => {
      const program = createProgram({
        basePath: '.',
        tsConfig: 'tsconfig.json',
        compilerOptions: {},
        files: []
      });

      expect(program.__internal.files).toEqual(fileNames);
      expect(program.__internal.options).toEqual(compilerOptions);
      expect(program.__internal.projectReferences).toEqual(projectReferences);
    });

    it('should merge files from config and input', () => {
      fileNames = ['file1.ts', 'file2.ts', 'file3.ts'];
      parseJsonConfigFileContentMock.mockReturnValueOnce({
        fileNames: ['file1.ts']
      });
      const program = createProgram({
        basePath: '.',
        tsConfig: 'tsconfig.json',
        files: fileNames
      });
      expect(program.__internal.files).toStrictEqual(fileNames);
    });

    it('should merge compilerOptions from config and input', () => {
      compilerOptions = { module: ts.ModuleKind.CommonJS, noEmit: true };
      parseJsonConfigFileContentMock.mockReturnValueOnce({
        compilerOptions: { module: ts.ModuleKind.ESNext }
      });
      const program = createProgram({
        basePath: '.',
        tsConfig: 'tsconfig.json',
        compilerOptions
      });
      expect(program.__internal.options).toStrictEqual(compilerOptions);
    });

    it('should merge projectReferences from config and input', () => {
      projectReferences = [{ path: 'project1' }, { path: 'project2' }];
      const program = createProgram({
        basePath: '.',
        tsConfig: 'tsconfig.json',
        projectReferences
      });

      expect(program.__internal.projectReferences).toEqual(projectReferences);
    });

    it('should assign projectReferences if config has no existing projectReferences', () => {
      projectReferences = [{ path: 'project1' }, { path: 'project2' }];
      parseJsonConfigFileContentMock.mockReturnValueOnce({
        projectReferences: []
      });
      const program = createProgram({
        basePath: '.',
        tsConfig: 'tsconfig.json',
        compilerOptions: {},
        files: [],
        projectReferences
      });

      expect(program.__internal.projectReferences).toEqual(projectReferences);
    });

    it('should throw if tsConfig is provided but has errors', () => {
      readConfigFileMock.mockReturnValueOnce({
        config: {},
        error: { messageText: 'Failed to read tsconfig file' }
      });

      expect(() => {
        createProgram({
          basePath: '',
          tsConfig: 'tsconfig.json',
          compilerOptions: {},
          files: []
        });
      }).toThrow('Failed to read tsconfig file');
    });

    it('should handle parsing errors from parseJsonConfigFileContent', () => {
      parseJsonConfigFileContentMock.mockReturnValueOnce({
        fileNames: [],
        options: {},
        projectReferences: [],
        errors: [{ messageText: '' }]
      });

      expect(() => {
        createProgram({
          basePath: '',
          tsConfig: 'tsconfig.json',
          compilerOptions: {},
          files: []
        });
      }).toThrow();
    });
  });

  describe('without tsconfig file', () => {
    it('should create program and return config when compilerOptions is used', () => {
      const result = createProgram({
        files: fileNames,
        compilerOptions: compilerOptions
      });

      expect(result.__internal.files).toEqual(fileNames);
      expect(result.__internal.options).toEqual(compilerOptions);
      expect(result.__internal.projectReferences).toEqual([]);
    });

    it('should throw if options errors', () => {
      optionsDiagnostics = [{ messageText: '' } as ts.Diagnostic];

      expect(() => {
        createProgram({
          files: [],
          compilerOptions: {}
        });
      }).toThrow();
    });
  });

  describe('invalid', () => {
    it('should throw if basePath, tsConfig, compilerOptions, and files options are missing', () => {
      expect(() => {
        createProgram({} as Compiler.CompileOptions);
      }).toThrow(
        'define basePath and tsConfig to implement configuration from tsconfig file\n' +
          'or define compilerOptions and files to implement configuration without tsconfig file.'
      );
    });
  });
});
