import { join } from 'node:path';
import ansis from 'ansis';
import { TypesTesting } from 'src';
import exampleModule from './example-module';

const basePath = join(process.cwd(), '__tests__/__integrations');
const { expectType } = new TypesTesting({
  basePath,
  tsConfig: 'tsconfig.json'
}).prepare();
const prepareThrowMessage = (fnName: string) => {
  return (receivedType: string, expectedType?: string, negated?: boolean) => {
    if (expectedType === undefined) {
      return ansis.reset(
        `expectType<${ansis.red('received')}>().${fnName}()\n\n` +
          `Received type: ${ansis.red(receivedType)}\n`
      );
    }

    return ansis.reset(
      `expectType<${ansis.red('received')}>().${fnName}<${ansis.green('expected')}>()\n\n` +
        `Expected type: ${negated === true ? 'not ' : ''}${ansis.green(expectedType)}\n` +
        `Received type: ${ansis.red(receivedType)}\n`
    );
  };
};

export const testCase = (
  describe: (label: string, fn: () => void) => void,
  test:
    | import('vitest').TestAPI
    | import('bun:test').Test
    | import('@jest/types').Global.ItConcurrent,
  expect:
    | import('vitest').ExpectStatic
    | import('bun:test').Expect
    | import('@jest/expect').JestExpect
) => {
  describe('toBeAny', () => {
    const throwMessage = prepareThrowMessage('toBeAny');

    test('positive test', () => {
      expect(() => {
        expectType<any>().toBeAny();
        expectType<never>().not.toBeAny();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<any>().not.toBeAny();
      }).toThrow(throwMessage('any'));

      expect(() => {
        expectType<unknown>().toBeAny();
      }).toThrow(throwMessage('unknown'));

      expect(() => {
        expectType<never>().toBeAny();
      }).toThrow(throwMessage('never'));

      expect(() => {
        expectType<{}>().toBeAny();
      }).toThrow(throwMessage('{}'));
    });
  });

  describe('toBeUnknown', () => {
    const throwMessage = prepareThrowMessage('toBeUnknown');

    test('positive test', () => {
      expect(() => {
        expectType<unknown>().toBeUnknown();
        expectType<any>().not.toBeUnknown();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<unknown>().not.toBeUnknown();
      }).toThrow(throwMessage('unknown'));

      expect(() => {
        expectType<any>().toBeUnknown();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeNever', () => {
    const throwMessage = prepareThrowMessage('toBeNever');

    test('positive test', () => {
      expect(() => {
        expectType<never>().toBeNever();
        expectType<any>().not.toBeNever();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<never>().not.toBeNever();
      }).toThrow(throwMessage('never'));

      expect(() => {
        expectType<any>().toBeNever();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeVoid', () => {
    const throwMessage = prepareThrowMessage('toBeVoid');

    test('positive test', () => {
      expect(() => {
        expectType<void>().toBeVoid();
        expectType<any>().not.toBeVoid();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<void>().not.toBeVoid();
      }).toThrow(throwMessage('void'));

      expect(() => {
        expectType<any>().toBeVoid();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeUndefined', () => {
    const throwMessage = prepareThrowMessage('toBeUndefined');

    test('positive test', () => {
      expect(() => {
        expectType<undefined>().toBeUndefined();
        expectType<any>().not.toBeUndefined();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<undefined>().not.toBeUndefined();
      }).toThrow(throwMessage('undefined'));

      expect(() => {
        expectType<any>().toBeUndefined();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeNull', () => {
    const throwMessage = prepareThrowMessage('toBeNull');

    test('positive test', () => {
      expect(() => {
        expectType<null>().toBeNull();
        expectType<any>().not.toBeNull();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<null>().not.toBeNull();
      }).toThrow(throwMessage('null'));

      expect(() => {
        expectType<any>().toBeNull();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeString', () => {
    const throwMessage = prepareThrowMessage('toBeString');

    test('positive test', () => {
      expect(() => {
        expectType<string>().toBeString();
        expectType<''>().toBeString();
        expectType<any>().not.toBeString();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<string>().not.toBeString();
      }).toThrow(throwMessage('string'));

      expect(() => {
        expectType<''>().not.toBeString();
      }).toThrow(throwMessage('""'));

      expect(() => {
        expectType<any>().toBeString();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeStringLiteral', () => {
    const throwMessage = prepareThrowMessage('toBeStringLiteral');

    test('positive test', () => {
      expect(() => {
        expectType<''>().toBeStringLiteral();
        expectType<string>().not.toBeStringLiteral();
        expectType<any>().not.toBeStringLiteral();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<''>().not.toBeStringLiteral();
      }).toThrow(throwMessage('""'));

      expect(() => {
        expectType<string>().toBeStringLiteral();
      }).toThrow(throwMessage('string'));

      expect(() => {
        expectType<any>().toBeStringLiteral();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeNumber', () => {
    const throwMessage = prepareThrowMessage('toBeNumber');

    test('positive test', () => {
      expect(() => {
        expectType<number>().toBeNumber();
        expectType<11>().toBeNumber();
        expectType<any>().not.toBeNumber();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<number>().not.toBeNumber();
      }).toThrow(throwMessage('number'));

      expect(() => {
        expectType<11>().not.toBeNumber();
      }).toThrow(throwMessage('11'));

      expect(() => {
        expectType<any>().toBeNumber();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeNumberLiteral', () => {
    const throwMessage = prepareThrowMessage('toBeNumberLiteral');

    test('positive test', () => {
      expect(() => {
        expectType<11>().toBeNumberLiteral();
        expectType<number>().not.toBeNumberLiteral();
        expectType<any>().not.toBeNumberLiteral();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<11>().not.toBeNumberLiteral();
      }).toThrow(throwMessage('11'));

      expect(() => {
        expectType<number>().toBeNumberLiteral();
      }).toThrow(throwMessage('number'));

      expect(() => {
        expectType<any>().toBeNumberLiteral();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeBoolean', () => {
    const throwMessage = prepareThrowMessage('toBeBoolean');

    test('positive test', () => {
      expect(() => {
        expectType<boolean>().toBeBoolean();
        expectType<true>().toBeBoolean();
        expectType<false>().toBeBoolean();
        expectType<any>().not.toBeBoolean();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<boolean>().not.toBeBoolean();
      }).toThrow(throwMessage('boolean'));

      expect(() => {
        expectType<true>().not.toBeBoolean();
      }).toThrow(throwMessage('true'));

      expect(() => {
        expectType<false>().not.toBeBoolean();
      }).toThrow(throwMessage('false'));

      expect(() => {
        expectType<any>().toBeBoolean();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeBooleanLiteral', () => {
    const throwMessage = prepareThrowMessage('toBeBooleanLiteral');

    test('positive test', () => {
      expect(() => {
        expectType<true>().toBeBooleanLiteral();
        expectType<false>().toBeBooleanLiteral();
        expectType<boolean>().not.toBeBooleanLiteral();
        expectType<any>().not.toBeBooleanLiteral();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<true>().not.toBeBooleanLiteral();
      }).toThrow(throwMessage('true'));

      expect(() => {
        expectType<false>().not.toBeBooleanLiteral();
      }).toThrow(throwMessage('false'));

      expect(() => {
        expectType<boolean>().toBeBooleanLiteral();
      }).toThrow(throwMessage('boolean'));

      expect(() => {
        expectType<any>().toBeBooleanLiteral();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeTrue', () => {
    const throwMessage = prepareThrowMessage('toBeTrue');

    test('positive test', () => {
      expect(() => {
        expectType<true>().toBeTrue();
        expectType<false>().not.toBeTrue();
        expectType<boolean>().not.toBeTrue();
        expectType<any>().not.toBeTrue();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<true>().not.toBeTrue();
      }).toThrow(throwMessage('true'));

      expect(() => {
        expectType<false>().toBeTrue();
      }).toThrow(throwMessage('false'));

      expect(() => {
        expectType<boolean>().toBeTrue();
      }).toThrow(throwMessage('boolean'));

      expect(() => {
        expectType<any>().toBeTrue();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeFalse', () => {
    const throwMessage = prepareThrowMessage('toBeFalse');

    test('positive test', () => {
      expect(() => {
        expectType<false>().toBeFalse();
        expectType<true>().not.toBeFalse();
        expectType<boolean>().not.toBeFalse();
        expectType<any>().not.toBeFalse();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<false>().not.toBeFalse();
      }).toThrow(throwMessage('false'));

      expect(() => {
        expectType<true>().toBeFalse();
      }).toThrow(throwMessage('true'));

      expect(() => {
        expectType<boolean>().toBeFalse();
      }).toThrow(throwMessage('boolean'));

      expect(() => {
        expectType<any>().toBeFalse();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeObject', () => {
    const throwMessage = prepareThrowMessage('toBeObject');

    test('positive test', () => {
      expect(() => {
        expectType<{ id: 11 }>().toBeObject();
        expectType<any>().not.toBeObject();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<{ id: 11 }>().not.toBeObject();
      }).toThrow(throwMessage('{ id: 11; }'));

      expect(() => {
        expectType<any>().toBeObject();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeArray', () => {
    const throwMessage = prepareThrowMessage('toBeArray');

    test('positive test', () => {
      expect(() => {
        expectType<[]>().toBeArray();
        expectType<string[]>().toBeArray();
        expectType<[string]>().toBeArray();
        expectType<any>().not.toBeArray();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<[]>().not.toBeArray();
      }).toThrow(throwMessage('[]'));

      expect(() => {
        expectType<string[]>().not.toBeArray();
      }).toThrow(throwMessage('string[]'));

      expect(() => {
        expectType<[string]>().not.toBeArray();
      }).toThrow(throwMessage('[string]'));

      expect(() => {
        expectType<any>().toBeArray();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeTuple', () => {
    const throwMessage = prepareThrowMessage('toBeTuple');

    test('positive test', () => {
      expect(() => {
        expectType<[]>().toBeTuple();
        expectType<[string]>().toBeTuple();
        expectType<string[]>().not.toBeTuple();
        expectType<any>().not.toBeTuple();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<[]>().not.toBeTuple();
      }).toThrow(throwMessage('[]'));

      expect(() => {
        expectType<[string]>().not.toBeTuple();
      }).toThrow(throwMessage('[string]'));

      expect(() => {
        expectType<string[]>().toBeTuple();
      }).toThrow(throwMessage('string[]'));

      expect(() => {
        expectType<any>().toBeTuple();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeFunction', () => {
    const throwMessage = prepareThrowMessage('toBeFunction');

    test('positive test', () => {
      expect(() => {
        expectType<() => void>().toBeFunction();
        expectType<any>().not.toBeFunction();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<() => void>().not.toBeFunction();
      }).toThrow(throwMessage('() => void'));

      expect(() => {
        expectType<any>().toBeFunction();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeClass', () => {
    const throwMessage = prepareThrowMessage('toBeClass');
    class DummyClass {
      constructor() {
        // dummy
      }
    }

    test('positive test', () => {
      expect(() => {
        expectType(new DummyClass()).toBeClass();
        expectType<any>().not.toBeClass();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<DummyClass>().not.toBeClass();
      }).toThrow(throwMessage('DummyClass'));

      expect(() => {
        expectType<any>().toBeClass();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeUnion', () => {
    const throwMessage = prepareThrowMessage('toBeUnion');

    test('positive test', () => {
      expect(() => {
        expectType<string | number>().toBeUnion();
        expectType<boolean>().toBeUnion();
        expectType<any>().not.toBeUnion();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<string | number>().not.toBeUnion();
      }).toThrow(throwMessage('string | number'));

      expect(() => {
        expectType<boolean>().not.toBeUnion();
      }).toThrow(throwMessage('boolean'));

      expect(() => {
        expectType<any>().toBeUnion();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBeIntersection', () => {
    const throwMessage = prepareThrowMessage('toBeIntersection');

    test('positive test', () => {
      expect(() => {
        expectType<{ a: string } & { b: string }>().toBeIntersection();
        expectType<true & false>().not.toBeIntersection();
        expectType<any>().not.toBeIntersection();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<{ a: string } & { b: string }>().not.toBeIntersection();
      }).toThrow(throwMessage('{ a: string; } & { b: string; }'));

      expect(() => {
        expectType<true & false>().toBeIntersection();
      }).toThrow(throwMessage('never'));

      expect(() => {
        expectType<any>().toBeIntersection();
      }).toThrow(throwMessage('any'));
    });
  });

  describe('toBe', () => {
    const throwMessage = prepareThrowMessage('toBe');

    test('positive test', () => {
      expect(() => {
        expectType<any>().toBe<any>();
        expectType<any>().not.toBe<unknown>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<any>().not.toBe<any>();
      }).toThrow(throwMessage('any', 'any', true));

      expect(() => {
        expectType<any>().toBe<unknown>();
      }).toThrow(throwMessage('any', 'unknown', false));
    });
  });

  describe('toEqual', () => {
    const throwMessage = prepareThrowMessage('toEqual');

    test('positive test', () => {
      expect(() => {
        expectType<any>().toEqual<any>();
        expectType<any>().not.toEqual<unknown>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<any>().not.toEqual<any>();
      }).toThrow(throwMessage('any', 'any', true));

      expect(() => {
        expectType<any>().toEqual<unknown>();
      }).toThrow(throwMessage('any', 'unknown', false));
    });
  });

  describe('toStrictEqual', () => {
    const throwMessage = prepareThrowMessage('toStrictEqual');

    test('positive test', () => {
      expect(() => {
        expectType<any>().toStrictEqual<any>();
        expectType<any>().not.toStrictEqual<unknown>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<any>().not.toStrictEqual<any>();
      }).toThrow(throwMessage('any', 'any', true));

      expect(() => {
        expectType<any>().toStrictEqual<unknown>();
      }).toThrow(throwMessage('any', 'unknown', false));
    });
  });

  describe('toExtends', () => {
    const throwMessage = prepareThrowMessage('toExtends');

    test('positive test', () => {
      expect(() => {
        expectType<true>().toExtends<boolean>();
        expectType<boolean>().not.toExtends<true>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<true>().not.toExtends<boolean>();
      }).toThrow(throwMessage('true', 'boolean', true));

      expect(() => {
        expectType<boolean>().toExtends<true>();
      }).toThrow(throwMessage('boolean', 'true', false));
    });
  });

  describe('toAssignable', () => {
    const throwMessage = prepareThrowMessage('toAssignable');

    test('positive test', () => {
      expect(() => {
        expectType<true>().toAssignable<boolean>();
        expectType<boolean>().not.toAssignable<true>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<true>().not.toAssignable<boolean>();
      }).toThrow(throwMessage('true', 'boolean', true));

      expect(() => {
        expectType<boolean>().toAssignable<true>();
      }).toThrow(throwMessage('boolean', 'true', false));
    });
  });

  describe('toCompatible', () => {
    const throwMessage = prepareThrowMessage('toCompatible');

    test('positive test', () => {
      expect(() => {
        expectType<true>().toCompatible<boolean>();
        expectType<boolean>().not.toCompatible<true>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<true>().not.toCompatible<boolean>();
      }).toThrow(throwMessage('true', 'boolean', true));

      expect(() => {
        expectType<boolean>().toCompatible<true>();
      }).toThrow(throwMessage('boolean', 'true', false));
    });
  });

  describe('toExtendsMutually', () => {
    const throwMessage = prepareThrowMessage('toExtendsMutually');

    test('positive test', () => {
      expect(() => {
        expectType<true>().toExtendsMutually<any>();
        expectType<true>().not.toExtendsMutually<boolean>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<true>().not.toExtendsMutually<any>();
      }).toThrow(throwMessage('true', 'any', true));

      expect(() => {
        expectType<true>().toExtendsMutually<boolean>();
      }).toThrow(throwMessage('true', 'boolean', false));
    });
  });

  describe('toAssignableMutually', () => {
    const throwMessage = prepareThrowMessage('toAssignableMutually');

    test('positive test', () => {
      expect(() => {
        expectType<true>().toAssignableMutually<any>();
        expectType<true>().not.toAssignableMutually<boolean>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<true>().not.toAssignableMutually<any>();
      }).toThrow(throwMessage('true', 'any', true));

      expect(() => {
        expectType<true>().toAssignableMutually<boolean>();
      }).toThrow(throwMessage('true', 'boolean', false));
    });
  });

  describe('toMutual', () => {
    const throwMessage = prepareThrowMessage('toMutual');

    test('positive test', () => {
      expect(() => {
        expectType<true>().toMutual<any>();
        expectType<true>().not.toMutual<boolean>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<true>().not.toMutual<any>();
      }).toThrow(throwMessage('true', 'any', true));

      expect(() => {
        expectType<true>().toMutual<boolean>();
      }).toThrow(throwMessage('true', 'boolean', false));
    });
  });

  describe('toExtendsEitherWay', () => {
    const throwMessage = prepareThrowMessage('toExtendsEitherWay');

    test('positive test', () => {
      expect(() => {
        expectType<boolean>().toExtendsEitherWay<true>();
        expectType<true>().not.toExtendsEitherWay<false>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<boolean>().not.toExtendsEitherWay<true>();
      }).toThrow(throwMessage('boolean', 'true', true));

      expect(() => {
        expectType<true>().toExtendsEitherWay<false>();
      }).toThrow(throwMessage('true', 'false', false));
    });
  });

  describe('toAssignableEitherWay', () => {
    const throwMessage = prepareThrowMessage('toAssignableEitherWay');

    test('positive test', () => {
      expect(() => {
        expectType<boolean>().toAssignableEitherWay<true>();
        expectType<true>().not.toAssignableEitherWay<false>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<boolean>().not.toAssignableEitherWay<true>();
      }).toThrow(throwMessage('boolean', 'true', true));

      expect(() => {
        expectType<true>().toAssignableEitherWay<false>();
      }).toThrow(throwMessage('true', 'false', false));
    });
  });

  describe('toRelate', () => {
    const throwMessage = prepareThrowMessage('toRelate');

    test('positive test', () => {
      expect(() => {
        expectType<boolean>().toRelate<true>();
        expectType<true>().not.toRelate<false>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType<boolean>().not.toRelate<true>();
      }).toThrow(throwMessage('boolean', 'true', true));

      expect(() => {
        expectType<true>().toRelate<false>();
      }).toThrow(throwMessage('true', 'false', false));
    });
  });

  describe('test module type', () => {
    test('positive test', () => {
      expect(() => {
        expectType(exampleModule.join).toBe<{
          (a: string, b: string): string;
          (a: number, b: number): number;
          (a: string, b: number): never;
          (a: number, b: string): never;
        }>();
        expectType(exampleModule.join('a', 'b')).toBe<string>();
        expectType(exampleModule.join(1, 2)).toBe<number>();
        expectType(exampleModule.join('a', 2)).toBe<never>();
        expectType(exampleModule.join(1, 'b')).toBe<never>();
      }).not.toThrow();
    });

    test('negative test', () => {
      expect(() => {
        expectType(exampleModule.join).toBe<{
          (a: string, b: string): never;
          (a: number, b: number): never;
          (a: string, b: number): string;
          (a: number, b: string): number;
        }>();
        expectType(exampleModule.join('a', 'b')).toBe<never>();
        expectType(exampleModule.join(1, 2)).toBe<never>();
        expectType(exampleModule.join('a', 2)).toBe<string>();
        expectType(exampleModule.join(1, 'b')).toBe<number>();
      }).toThrow();
    });
  });

  describe('invocation variants', () => {
    test('supported invocation', () => {
      expect(() => {
        expectType<false>().toBe<true>();
      }).toThrow();

      expect(() => {
        const expectFalse = expectType<false>;
        expectFalse().toBe<true>();
      }).toThrow();

      expect(() => {
        const expectFalseToBeTrue = expectType<false>().toBe<true>;
        expectFalseToBeTrue();
      }).toThrow();

      expect(() => {
        const expectTrueNotToBeTrue = expectType<true>().not.toBe<true>;
        expectTrueNotToBeTrue();
      }).toThrow();

      expect(() => {
        const expectFalseToBe = expectType<false>().toBe;
        expectFalseToBe<true>();
      }).toThrow();

      expect(() => {
        const { toBe } = expectType<false>();
        toBe<true>();
      }).toThrow();

      expect(() => {
        const expectFalseToBeTrue = expectType<false>().toBe<true>;
        expectFalseToBeTrue.call(undefined);
      }).toThrow();

      expect(() => {
        const expectFalseToBeTrue = expectType<false>().toBe<true>;
        expectFalseToBeTrue.apply(undefined, []);
      }).toThrow();

      expect(() => {
        const expectFalseToBe = expectType<false>().toBe;
        (expectFalseToBe<true>).call(undefined);
      }).toThrow();

      expect(() => {
        const expectFalseToBe = expectType<false>().toBe;
        (expectFalseToBe<true>).apply(undefined, []);
      }).toThrow();
    });

    test('unsupported invocation', () => {
      expect(() => {
        const expectFalseToBeTrue = expectType<false>().toBe<true>;
        expectFalseToBeTrue.call<undefined, [], unknown>(undefined);
      }).not.toThrow();

      expect(() => {
        const expectFalseToBeTrue = expectType<false>().toBe<true>;
        expectFalseToBeTrue.apply<undefined, [], unknown>(undefined, []);
      }).not.toThrow();
    });
  });
};
