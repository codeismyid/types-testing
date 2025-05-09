import { join } from 'node:path';
import { TypesTesting } from 'src';
import exampleModule from './example-module';
import * as ExampleTypes from './example-types';

if (process.versions.bun) {
  let bunTest = (await import('bun:test')).default;

  if (!bunTest) {
    bunTest = await import('bun:test');
  }

  global.describe = bunTest.describe as unknown as typeof global.describe;
  global.test = bunTest.test as unknown as typeof global.test;
} else if (process.env.VITEST) {
  const vitest = await import('vitest');
  global.describe = vitest.describe as unknown as typeof global.describe;
  global.test = vitest.test as unknown as typeof global.test;
}

const basePath = join(process.cwd(), '__tests__/__example');
const { expectType } = new TypesTesting({
  basePath,
  tsConfig: 'tsconfig.json'
}).prepare();

describe('example-module', () => {
  test(`exampleModule.name type is 'example-module'`, () => {
    // using runtime argument
    expectType(exampleModule.name).toBe<'example-module'>();
    expectType(exampleModule.name).toBeStringLiteral();

    // using type argument
    expectType<typeof exampleModule.name>().toBe<'example-module'>();
    expectType<typeof exampleModule.name>().toBeString();
  });

  test(`exampleModule.getName type is function without parameter and return 'example-module'`, () => {
    // using runtime argument
    expectType(exampleModule.getName).toBe<() => 'example-module'>();
    expectType(exampleModule.getName).toBe<{
      (): 'example-module';
    }>();
    expectType(exampleModule.getName()).toBe<'example-module'>();

    // using type argument
    expectType<typeof exampleModule.getName>().toBe<() => 'example-module'>();
    expectType<typeof exampleModule.getName>().toBe<{
      (): 'example-module';
    }>();
    expectType<
      ReturnType<typeof exampleModule.getName>
    >().toBe<'example-module'>();
  });

  if (process.env.FAIL_EXAMPLE_TEST) {
    test('fail example', () => {
      expectType(exampleModule.name).toBe<string>();
    });
  }
});

describe('example-types', () => {
  test('KeyOf is utility types for getting keys from object type', () => {
    expectType<ExampleTypes.KeyOf<{ a: 1; b: 2; c: 3 }>>().toBe<
      'a' | 'b' | 'c'
    >();
  });

  if (process.env.FAIL_EXAMPLE_TEST) {
    test('fail example', () => {
      expectType<ExampleTypes.KeyOf<{ a: 1; b: 2; c: 3 }>>().toBe<1 | 2 | 3>();
    });
  }
});
