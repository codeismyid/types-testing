<div align="center">
  
# types-testing

Test TypeScript types at test runner runtime - Works seamlessly with Jest, Vitest, and Bun.

[![License](https://img.shields.io/github/license/codeismyid/types-testing?style=flat-square&color=blue)](/LICENSE)
[![NPM Latest](https://img.shields.io/npm/v/types-testing.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/types-testing)
[![NPM Downloads](https://img.shields.io/npm/dt/types-testing.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/types-testing)
[![NPM Min Size](https://img.shields.io/bundlejs/size/types-testing?style=flat-square&color=blue)](https://www.npmjs.com/package/types-testing)

[![CI](https://img.shields.io/github/actions/workflow/status/codeismyid/types-testing/ci.yaml?style=flat-square&logo=github&label=CI&labelColor=383f47)](https://github.com/codeismyid/types-testing/actions/workflows/ci.yaml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/codeismyid/types-testing/codeql.yaml?style=flat-square&logo=github&label=CodeQL&labelColor=383f47)](https://github.com/codeismyid/types-testing/actions/workflows/codeql.yaml)
[![Codecov](https://img.shields.io/codecov/c/github/codeismyid/types-testing?style=flat-square&logo=codecov&label=Coverage&labelColor=383f47)](https://app.codecov.io/github/codeismyid/types-testing)
[![Type Coverage](https://img.shields.io/badge/dynamic/json.svg?style=flat-square&logo=typescript&label=Coverage&labelColor=383f47&color=44cc11&prefix=≥&suffix=%&query=$.typeCoverage.atLeast&uri=https://github.com/codeismyid/types-testing/raw/main/package.json)](https://github.com/codeismyid/types-testing)

</div>

- **Types Testing**: Ensures TypeScript types or definitions are tested.
- **Readable Tests**: Uses the expect-assertion style for clean and easy-to-read types testing.
- **Variative Assertions**: Provides assertions like `toBe`, `toBeNever`, `toBeUnknown`, `toBeVoid`, `toBeAny`, and more for checking.
- **Framework Agnostic**: Seamlessly works with [Jest (TypeScript)](https://jestjs.io/docs/getting-started#using-typescript), [Vitest](https://vitest.dev/), [Bun Test](https://bun.sh/docs/cli/test), and other TypeScript testing frameworks.
- **Easy Integration**: Integrates smoothly into TypeScript testing frameworks.
- **No Special Comments Needed**: No need to add special comment like `@ts-expect-error`, just write clean and readable types tests code inside the existing test suite.
- **Runtime Stack Traces**: Offers detailed stack traces for failed tests.

#### Example Showcases

Here is an example of how `types-testing` tests TypeScript types or definitions ([sources](https://github.com/codeismyid/types-testing/tree/main/__tests__/__example])):

```ts
// example.test.ts
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

// example-module.js
export default {
  name: 'example-module',
  getName(){
    return this.name;
  }
};

// example-module.d.ts
declare const exampleModule: {
  name: 'example-module';
  getName(): 'example-module';
}

export default exampleModule;

// example-types.ts
export type KeyOf<T> = T extends T ? keyof T : never;
```

<details open>
<summary>Result from Jest (29.7.0)</summary>

```
 FAIL  __tests__/__example/example.test.ts
  example-module
    √ exampleModule.name type is 'example-module' (12 ms)
    √ exampleModule.getName type is function without parameter and return 'example-module' (5 ms)
    × fail example (2 ms)
  example-types
    √ KeyOf is utility types for getting keys from object type (1 ms)
    × fail example (1 ms)

  ● example-module › fail example

    TypesTestingError: expectType<received>().toBe<expected>()

    Expected type: string
    Received type: "example-module"


      56 |   if (process.env.FAIL_EXAMPLE_TEST) {
      57 |     test('fail example', () => {
    > 58 |       expectType(exampleModule.name).toBe<string>();
         |                                      ^
      59 |     });
      60 |   }
      61 | });

      at Object.<anonymous> (__tests__/__example/example.test.ts:58:38)

  ● example-types › fail example

    TypesTestingError: expectType<received>().toBe<expected>()

    Expected type: 1 | 2 | 3
    Received type: "a" | "b" | "c"


      70 |   if (process.env.FAIL_EXAMPLE_TEST) {
      71 |     test('fail example', () => {
    > 72 |       expectType<ExampleTypes.KeyOf<{ a: 1; b: 2; c: 3 }>>().toBe<1 | 2 | 3>();
         |                                                              ^
      73 |     });
      74 |   }
      75 | });

      at Object.<anonymous> (__tests__/__example/example.test.ts:72:62)

Test Suites: 1 failed, 1 total
Tests:       2 failed, 3 passed, 5 total
Snapshots:   0 total
Time:        2.336 s, estimated 3 s
```
</details>

<details>
<summary>Result from Vitest (3.1.1)</summary>

```
 RUN  v3.1.2 /@codeismyid/types-testing

 ❯ __tests__/__example/example.test.ts (5 tests | 2 failed) 12ms
   ✓ example-module > exampleModule.name type is 'example-module' 6ms
   ✓ example-module > exampleModule.getName type is function without parameter and return 'example-module' 2ms
   × example-module > fail example 2ms
     → expectType<received>().toBe<expected>()

Expected type: string
Received type: "example-module"

   ✓ example-types > KeyOf is utility types for getting keys from object type 0ms
   × example-types > fail example 1ms
     → expectType<received>().toBe<expected>()

Expected type: 1 | 2 | 3
Received type: "a" | "b" | "c"


⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  __tests__/__example/example.test.ts > example-module > fail example
TypesTestingError: expectType<received>().toBe<expected>()

Expected type: string
Received type: "example-module"

 ❯ __tests__/__example/example.test.ts:55:38
     56|   if (process.env.FAIL_EXAMPLE_TEST) {
     57|     test('fail example', () => {
     58|       expectType(exampleModule.name).toBe<string>();
       |                                      ^
     59|     });
     60|   }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  __tests__/__example/example.test.ts > example-types > fail example
TypesTestingError: expectType<received>().toBe<expected>()

Expected type: 1 | 2 | 3
Received type: "a" | "b" | "c"

 ❯ __tests__/__example/example.test.ts:69:62
     70|   if (process.env.FAIL_EXAMPLE_TEST) {
     71|     test('fail example', () => {
     72|       expectType<ExampleTypes.KeyOf<{ a: 1; b: 2; c: 3 }>>().toBe<1 | 2 | 3>();
       |                                                              ^
     73|     });
     74|   }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 3 passed (5)
   Start at  21:39:24
   Duration  2.78s (transform 185ms, setup 0ms, collect 2.33s, tests 12ms, environment 0ms, prepare 122ms)
```
</details>

<details>
<summary>Result from Bun Test (1.1.42)</summary>

```
bun test v1.1.42 (50eec002)

__tests__/__example/example.test.ts:
✓ example-module > exampleModule.name type is 'example-module' [16.00ms]
✓ example-module > exampleModule.getName type is function without parameter and return 'example-module' [15.00ms]
53 |     >().toBe<'example-module'>();
54 |   });
55 |
56 |   if (process.env.FAIL_EXAMPLE_TEST) {
57 |     test('fail example', () => {
58 |       expectType(exampleModule.name).toBe<string>();
                                          ^
TypesTestingError: expectType<received>().toBe<expected>()

Expected type: string
Received type: "example-module"

      at /@codeismyid/types-testing/__tests__/__example/example.test.ts:58:38
✗ example-module > fail example [16.00ms]
✓ example-types > KeyOf is utility types for getting keys from object type
67 |     >();
68 |   });
69 |
70 |   if (process.env.FAIL_EXAMPLE_TEST) {
71 |     test('fail example', () => {
72 |       expectType<ExampleTypes.KeyOf<{ a: 1; b: 2; c: 3 }>>().toBe<1 | 2 | 3>();
                                                                  ^
TypesTestingError: expectType<received>().toBe<expected>()

Expected type: 1 | 2 | 3
Received type: "a" | "b" | "c"

      at /@codeismyid/types-testing/__tests__/__example/example.test.ts:72:62
✗ example-types > fail example [16.00ms]

 3 pass
 2 fail
Ran 5 tests across 1 files. [2.09s]
```
</details>


## Installation

```bash
# NPM
npm install --save-dev types-testing

# BUN
bun add -d types-testing
```


## Usage

#### Default Options

```ts
import { expectType } from 'types-testing';

describe('test', () => {
  test('test', () => {
    expectType<string>().toBe<string>();
  });
});
```
> Note: `prepare` function get invoked when `expectType` is called at the first time with `process.cwd()` as base path and `tsconfig.json` as TypeScript configuration file.

#### Custom Typescript Configuration File 

```ts
import { expectType, prepare } from 'types-testing';

prepare({ basePath: 'this/is/basepath', tsConfig: 'tsconfig.test.json' });

describe('test', () => {
  test('test', () => {
    expectType<string>().toBe<string>();
  });
});
```

#### Extending Typescript Configuration File

```ts
import { expectType, prepare } from 'types-testing';

prepare({
  basePath: 'this/is/basepath',
  tsConfig: 'tsconfig.test.json',
  compilerOptions: {
    // add ts compiler options to extends typescript compiler options from tsconfig file
  },
  files: [
    // add included files to extends included files from tsconfig file
  ],
  projectReferences: [
    // add project references to extends project references from tsconfig file.
  ]
});

describe('test', () => {
  test('test', () => {
    expectType<string>().toBe<string>();
  });
});
```

#### Configuration Without Typescript Configuration File 

```ts
import { expectType, prepare } from 'types-testing';

prepare({
  compilerOptions: {
    // add ts compiler options
  },
  files: [
    // add included files
  ]
})

describe('test', () => {
  test('test', () => {
    expectType<string>().toBe<string>();
  });
});
```

#### Custom Instance

```ts
import { TypesTesting } from 'types-testing';

const { expectType, prepare } = new TypesTesting({ 
  autoPrepare: false,
  basePath: process.cwd(), 
  tsConfig: 'tsconfig.test.json' 
});

describe('test', () => {
  beforeAll(()=>{
    prepare();
  });

  test('test', () => {
    expectType<string>().toBe<string>();
  });
});
```


## Developed With

- [Typescript](https://www.typescriptlang.org/) - Strongly typed programming language that builds on JavaScript.
- [Bun](https://bun.sh/) - All-in-one JavaScript runtime & toolkit designed for speed, complete with a bundler, test runner, and Node.js-compatible package manager.


## License

The code in this project is released under the [MIT License](LICENSE).