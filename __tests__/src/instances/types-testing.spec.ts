import { describe, expect, it } from 'bun:test';
import { TypesTesting } from 'src/blueprints';
import * as instance from 'src/instances/types-testing';

describe('src > instances > types-testing', () => {
  describe('default export', () => {
    it('should be instance of TypesTesting', () => {
      expect(instance.default).toBeInstanceOf(TypesTesting);
    });

    describe('isPrepared', () => {
      it('should return boolean', () => {
        expect(instance.default.isPrepared).toBeBoolean();
      });
    });

    describe('options', () => {
      it('should return object', () => {
        expect(instance.default.options).toBeObject();
      });

      it('should use `true` as autoPrepare value', () => {
        expect(instance.default.options.autoPrepare).toBe(true);
      });

      it('should use `process.cwd()` as basePath value', () => {
        expect(instance.default.options.basePath).toBe(process.cwd());
      });

      it('should use `tsconfig.json` as tsconfig value', () => {
        expect(instance.default.options.tsConfig).toBe('tsconfig.json');
      });
    });

    describe('prepare', () => {
      it('should be function', () => {
        expect(instance.default.prepare).toBeFunction();
      });
    });

    describe('reset', () => {
      it('should be function', () => {
        expect(instance.default.reset).toBeFunction();
      });
    });

    describe('expectType', () => {
      it('should be function', () => {
        expect(instance.default.expectType).toBeFunction();
      });
    });
  });

  describe('named export', () => {
    describe('prepare', () => {
      it('should same as default.prepare', () => {
        expect(instance.prepare).toStrictEqual(instance.default.prepare);
      });
    });

    describe('reset', () => {
      it('should same as default.reset', () => {
        expect(instance.reset).toStrictEqual(instance.default.reset);
      });
    });

    describe('expectType', () => {
      it('should same as default.expectType', () => {
        expect(instance.expectType).toStrictEqual(instance.default.expectType);
      });
    });
  });
});
