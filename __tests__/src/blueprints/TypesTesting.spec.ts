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
import * as Lib from 'lib';
import * as __Internal from 'src/blueprints/__internal/TypesTestingError';
import { TypesTesting } from 'src/blueprints/TypesTesting';

const { TypesTestingError: OriginalTypesTestingError } = __Internal;
const { Compiler: OriginalCompiler, Assertion: OriginalAssertion } = Lib;

describe('src > blueprints > TypesTesting', () => {
  let error: __Internal.TypesTestingError;
  let compileMock: jest.Mock<Compiler.Compile>;
  let assertionMock: typeof OriginalAssertion;
  let TypesTestingErrorMock: jest.SpiedClass<typeof OriginalTypesTestingError>;

  beforeEach(() => {
    error = {
      name: '',
      message: '',
      stack: '',
      errors: new Map<string, Compiler.CompileResultError>()
    } as unknown as __Internal.TypesTestingError;

    compileMock = jest.fn(() => ({
      files: ['test.ts'],
      options: {},
      errors: new Map<string, Compiler.CompileResultError>()
    }));

    assertionMock = {
      toBe: jest.fn()
    } as unknown as typeof assertionMock;

    TypesTestingErrorMock = jest
      .fn()
      .mockImplementation(
        (
          _: Map<string, Compiler.CompileResultError>,
          onErrorFound: __Internal.OnErrorFound
        ) => {
          onErrorFound('');
          return error;
        }
      );

    mock.module('lib', () => ({
      Compiler: {
        compile: compileMock
      },
      Assertion: assertionMock
    }));

    mock.module('src/blueprints/__internal/TypesTestingError', () => ({
      TypesTestingError: TypesTestingErrorMock
    }));
  });

  afterEach(() => {
    mock.module('src/blueprints/__internal/TypesTestingError', () => ({
      TypesTestingError: OriginalTypesTestingError
    }));
    mock.module('lib', () => {
      return {
        Assertion: OriginalAssertion,
        Compiler: OriginalCompiler
      };
    });
  });

  describe('instantiation', () => {
    it('should instantiated with default options', () => {
      const test = new TypesTesting({});

      expect(test.options.autoPrepare).toBe(true);
    });

    it('should instantiated with custom options', () => {
      const test = new TypesTesting({
        autoPrepare: false,
        tsConfig: 'custom-tsconfig.json',
        files: ['file.ts']
      });

      expect(test.options.autoPrepare).toBe(false);
      expect(test.options.tsConfig).toBe('custom-tsconfig.json');
      expect(test.options.files).toEqual(['file.ts']);
    });
  });

  describe('isPrepared', () => {
    it('should report isPrepared correctly', () => {
      const test = new TypesTesting({});
      expect(test.isPrepared).toBe(false);

      test.prepare();
      expect(test.isPrepared).toBe(true);
    });

    it('should compile only once if already prepared', () => {
      const test = new TypesTesting({});
      test.prepare();
      test.prepare();

      expect(compileMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset', () => {
    it('should reset compile result and optionally re-prepare', () => {
      const test = new TypesTesting({});
      test.prepare();
      expect(test.isPrepared).toBe(true);

      test.reset();
      expect(test.isPrepared).toBe(false);

      test.prepare();
      expect(test.isPrepared).toBe(true);

      test.reset(true);
      expect(test.isPrepared).toBe(true);
    });
  });

  describe('expectType', () => {
    it('should preparing at the first call if autoPrepare is true', () => {
      const test = new TypesTesting({ autoPrepare: true });
      test.expectType<'some-type'>();
      expect(compileMock).toHaveBeenCalledTimes(1);
    });

    it('should throw error if not prepared', () => {
      const test = new TypesTesting({ autoPrepare: false });
      expect(() => test.expectType<'not-prepared'>()).toThrow(
        'need to run prepare first.'
      );
    });

    it('should throw if error.name exists', () => {
      const test = new TypesTesting({});
      test.prepare();

      const { toBe } = test.expectType();

      error.name = 'TypesTestingError';
      expect(() => test.expectType<'error on expect call'>()).toThrow();
      expect(() => toBe<'error on assertionCall'>()).toThrow();
    });

    it('should return assertion methods when no error', () => {
      const test = new TypesTesting({});
      test.prepare();

      const assertions = test.expectType<'valid-type'>();
      expect(assertions).toContainAllKeys(['not', 'toBe']);
      expect(assertions.not).toContainAllKeys(['toBe']);
    });
  });
});
