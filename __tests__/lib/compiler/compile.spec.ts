import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  mock,
  spyOn
} from 'bun:test';
import * as Compiler from 'lib/compiler';
import ts from 'typescript';

const options = {} as Compiler.CompileOptions;

describe('lib > compiler > compile', () => {
  const tsMock = {
    isCallExpression: jest.fn<typeof ts.isCallExpression>(),
    isPropertyAccessExpression: jest.fn<typeof ts.isPropertyAccessExpression>()
  };
  let createErrorKeySpy: jest.Mock<typeof Compiler.createErrorKey>;
  let createErrorValueSpy: jest.Mock<typeof Compiler.createErrorValue>;
  let createProgramSpy: jest.Mock<typeof Compiler.createProgram>;
  let getTypeCheckerSpy: jest.Mock<typeof Compiler.getTypeChecker>;
  let traverseSourceFileSpy: jest.Mock<typeof Compiler.traverseSourceFile>;
  let validateAssertionSpy: jest.Mock<typeof Compiler.validateAssertion>;

  beforeEach(() => {
    mock.module('typescript', () => {
      return {
        default: {
          ...ts,
          ...tsMock
        }
      };
    });

    createErrorKeySpy = spyOn(Compiler, 'createErrorKey').mockReturnValue(
      'errorKey'
    );

    createErrorValueSpy = spyOn(Compiler, 'createErrorValue').mockReturnValue(
      {} as Compiler.CompileResultError
    );

    createProgramSpy = spyOn(Compiler, 'createProgram').mockReturnValue({
      getSourceFile: jest.fn(() => ({})),
      __internal: {
        files: ['file1.ts'],
        options: {}
      }
    } as unknown as Compiler.Program);

    getTypeCheckerSpy = spyOn(Compiler, 'getTypeChecker').mockReturnValue({
      __internal: {
        identifyTestCall: jest.fn(),
        postIdentifyTestCall: jest.fn()
      }
    } as unknown as Compiler.TypeChecker);

    traverseSourceFileSpy = spyOn(
      Compiler,
      'traverseSourceFile'
    ).mockImplementation((node, callback) => {
      callback(node);
    });

    validateAssertionSpy = spyOn(Compiler, 'validateAssertion').mockReturnValue(
      true
    );
  });

  afterEach(() => {
    mock.module('typescript', () => {
      return {
        default: ts
      };
    });
    createErrorKeySpy.mockRestore();
    createErrorValueSpy.mockRestore();
    createProgramSpy.mockRestore();
    getTypeCheckerSpy.mockRestore();
    traverseSourceFileSpy.mockRestore();
    validateAssertionSpy.mockRestore();
  });

  describe('no files from config', () => {
    beforeEach(() => {
      createProgramSpy.mockReturnValue({
        getSourceFile: jest.fn(),
        __internal: {
          files: [],
          options: {}
        }
      } as unknown as Compiler.Program);
    });

    it('should return empty files', () => {
      const result = Compiler.compile(options);
      expect(result.files).toEqual([]);
    });

    it('should return correct options', () => {
      const result = Compiler.compile(options);
      expect(result.options).toEqual({});
    });

    it('should return errors collection with 0 size', () => {
      const result = Compiler.compile(options);
      expect(result.errors.size).toBe(0);
    });
  });

  describe('no sourceFile', () => {
    beforeEach(() => {
      createProgramSpy.mockReturnValue({
        getSourceFile: jest.fn(),
        __internal: {
          files: ['file1.ts'],
          options: {}
        }
      } as unknown as Compiler.Program);
    });

    it('should return files correctly', () => {
      const result = Compiler.compile(options);
      expect(result.files).toEqual(['file1.ts']);
    });

    it('should return correct options', () => {
      const result = Compiler.compile(options);
      expect(result.options).toEqual({});
    });

    it('should return errors collection with 0 size', () => {
      const result = Compiler.compile(options);
      expect(result.errors.size).toBe(0);
    });
  });

  describe('no errors found', () => {
    beforeEach(() => {
      validateAssertionSpy.mockReturnValue(true);
    });

    describe('because no test calls were found', () => {
      beforeEach(() => {
        getTypeCheckerSpy.mockReturnValue({
          __internal: {
            identifyTestCall: jest.fn(() => null)
          }
        } as unknown as Compiler.TypeChecker);
      });

      it('should return errors collection with 0 size', () => {
        const result = Compiler.compile(options);
        expect(result.errors.size).toBe(0);
      });
    });

    describe('because no errors were found', () => {
      describe('expect call', () => {
        beforeEach(() => {
          getTypeCheckerSpy.mockReturnValue({
            __internal: {
              identifyTestCall: jest.fn(() => ({
                type: 'expect',
                props: {
                  receivedType: {}
                }
              }))
            }
          } as unknown as Compiler.TypeChecker);
        });

        it('should return errors collection with 0 size', () => {
          const result = Compiler.compile(options);
          expect(result.errors.size).toBe(0);
        });
      });

      describe('assertion call', () => {
        beforeEach(() => {
          getTypeCheckerSpy.mockReturnValue({
            __internal: {
              identifyTestCall: jest.fn(() => ({
                type: 'assertion',
                props: {
                  receivedType: {}
                }
              }))
            }
          } as unknown as Compiler.TypeChecker);
        });

        it('should return errors collection with 0 size', () => {
          const result = Compiler.compile(options);
          expect(result.errors.size).toBe(0);
        });
      });
    });
  });

  describe('errors found', () => {
    let type: 'expect' | 'assertion';
    let receivedType: ts.Type | undefined;

    beforeEach(() => {
      receivedType = {} as ts.Type;

      getTypeCheckerSpy.mockReturnValue({
        __internal: {
          identifyTestCall: jest.fn(() => ({
            type,
            props: {
              receivedType
            }
          })),
          postIdentifyTestCall: jest.fn(() => ({}))
        }
      } as unknown as Compiler.TypeChecker);

      validateAssertionSpy.mockReturnValue(false);
    });

    describe('expect call', () => {
      beforeEach(() => {
        type = 'expect';
      });

      it('should create error if receivedType is undefined', () => {
        receivedType = undefined;
        expect(Compiler.compile(options).errors.has('errorKey')).toBe(true);
        expect(Compiler.compile(options).errors.get('errorKey')).toEqual(
          {} as Compiler.CompileResultError
        );
        expect(Compiler.compile(options).errors.size).toBe(1);
      });
    });

    describe('assertion call', () => {
      beforeEach(() => {
        type = 'assertion';
      });

      it('should create error if receivedType is undefined', () => {
        receivedType = undefined;
        expect(Compiler.compile(options).errors.has('errorKey')).toBe(true);
        expect(Compiler.compile(options).errors.get('errorKey')).toEqual(
          {} as Compiler.CompileResultError
        );
        expect(Compiler.compile(options).errors.size).toBe(1);
      });

      it('should create error if assertion is not valid', () => {
        expect(Compiler.compile(options).errors.has('errorKey')).toBe(true);
        expect(Compiler.compile(options).errors.get('errorKey')).toEqual(
          {} as Compiler.CompileResultError
        );
        expect(Compiler.compile(options).errors.size).toBe(1);
      });
    });
  });
});
