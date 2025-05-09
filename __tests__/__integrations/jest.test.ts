import { describe, expect, jest, test } from '@jest/globals';
import { testCase } from './test-case';

if (process.versions.bun) {
  let bunTest = (await import('bun:test')).default;

  if (!bunTest) {
    bunTest = await import('bun:test');
  }

  const { describe, test, expect } = bunTest;

  const jestResult: {
    numFailedTests: number;
    success: boolean;
    testResults: {
      assertionResults: {
        ancestorTitles: string[];
        fullName: string;
        status: 'passed' | 'failed';
        title: string;
        duration: number;
        failureMessages: string[];
        meta: Record<string, unknown>;
      }[];
    }[];
  } =
    await Bun.$`node --experimental-vm-modules node_modules/jest/bin/jest.js jest.test.ts -c=__tests__/__integrations/jest.config.ts --json`
      .nothrow()
      .json();

  describe('jest', () => {
    test('successfully run in jest', () => {
      expect(jestResult.success).toBe(true);
      expect(jestResult.numFailedTests).toBe(0);
    });

    const testResult = jestResult.testResults[0];
    for (const result of testResult.assertionResults) {
      describe(result.ancestorTitles.slice(1).join('>'), () => {
        test(`${result.title}`, () => {
          expect(result.status, result.failureMessages.join('\n')).toBe(
            'passed'
          );
        });
      });
    }
  });
} else {
  const originalAnsis = await import('ansis');
  jest.mock('ansis', () => {
    return {
      ...originalAnsis,
      default: {
        ...originalAnsis.default,
        green: jest.fn((str: string) => str),
        red: jest.fn((str: string) => str),
        reset: jest.fn((str: string) => str)
      }
    };
  });

  describe('typesTesting', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    testCase(describe, test, expect);
  });
}
