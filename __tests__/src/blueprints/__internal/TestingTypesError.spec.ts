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
import * as Ansis from 'ansis';
import type { Compiler } from 'lib';
import {
  type AfterErrorFound,
  TypesTestingError
} from 'src/blueprints/__internal/TypesTestingError';

describe('TypesTestingError', () => {
  let afterErrorFound: AfterErrorFound;
  let errorMessage: string;
  let errors: Compiler.CompileResult['errors'];

  beforeEach(() => {
    afterErrorFound = jest.fn();
    errorMessage = 'message';
    errors = new Map<string, Compiler.CompileResultError>();
  });

  describe('instantiation', () => {
    it('should be instance of Error', () => {
      const error = new TypesTestingError(errors, afterErrorFound);
      expect(error).toBeInstanceOf(Error);
    });

    describe('no error found', () => {
      let error: TypesTestingError;

      beforeEach(() => {
        error = new TypesTestingError(errors, afterErrorFound);
      });

      it('should not call afterErrorFound fn', () => {
        expect(afterErrorFound).toHaveBeenCalledTimes(0);
      });

      it('should return empty name', () => {
        expect(error.name).toBe('');
      });

      it('should return empty message', () => {
        expect(error.message).toBe('');
      });

      it('should return undefined stack', () => {
        expect(error.stack).toBeUndefined();
      });

      it('should return undefined cause', () => {
        expect(error.cause).toBeUndefined();
      });
    });

    describe('error found', () => {
      const originalAnsis = { ...Ansis };
      let error: TypesTestingError;

      beforeEach(() => {
        mock.module('ansis', () => {
          return {
            ...Ansis,
            default: {
              ...originalAnsis.default,
              green: jest.fn(() => errorMessage),
              red: jest.fn(() => errorMessage),
              reset: jest.fn(() => errorMessage)
            }
          };
        });

        spyOn(errors, 'delete');
        spyOn(errors, 'get').mockImplementation(() => {
          return {
            expectCallExpressionText: 'expectType',
            assertionCallExpressionText: 'toBe',
            expectedType: 'string',
            receivedType: 'number',
            need2TypeArguments: true,
            isNegated: true
          } as Compiler.CompileResultError;
        });

        error = new TypesTestingError(errors, afterErrorFound);
      });

      afterEach(() => {
        mock.module('ansis', () => {
          return {
            ...originalAnsis
          };
        });
      });

      it('should call afterErrorFound fn', () => {
        expect(afterErrorFound).toHaveBeenCalledTimes(1);
      });

      it('should return TypesTestingError name', () => {
        expect(error.name).toBe('TypesTestingError');
      });

      it('should return message correctly', () => {
        expect(error.message).toBe(errorMessage);
      });

      it('should return undefined cause', () => {
        expect(error.cause).toBeUndefined();
      });

      it('should return string stack', () => {
        expect(error.stack).toBeString();
      });

      it('should call ansis.red', () => {
        expect(Ansis.default.red).toHaveBeenCalledTimes(2);
      });

      it('should call ansis.green', () => {
        expect(Ansis.default.green).toHaveBeenCalledTimes(2);
      });

      it('should call ansis.reset', () => {
        expect(Ansis.default.reset).toHaveBeenCalledTimes(1);
      });

      it('should call Map.get', () => {
        expect(errors.get).toHaveBeenCalledTimes(1);
      });
    });
  });
});
