import { afterEach, describe, expect, test, vi } from 'vitest';
import { testCase } from './test-case';

if (process.versions.bun) {
  let bunTest = (await import('bun:test')).default;

  if (!bunTest) {
    bunTest = await import('bun:test');
  }

  const { describe, test, expect } = bunTest;

  const vitestResult: {
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
  } = await Bun.$`bunx vitest run vitest.test.ts --reporter=json`
    .nothrow()
    .json();

  describe('vitest', () => {
    test('successfully run in vitest', () => {
      expect(vitestResult.success).toBe(true);
      expect(vitestResult.numFailedTests).toBe(0);
    });

    const testResult = vitestResult.testResults[0];
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
  vi.mock('ansis', async (importOriginal) => {
    const originalAnsis = await importOriginal<typeof import('ansis')>();
    return {
      ...originalAnsis,
      default: {
        ...originalAnsis.default,
        green: vi.fn((str: string) => str),
        red: vi.fn((str: string) => str),
        reset: vi.fn((str: string) => str)
      }
    };
  });

  describe('typesTesting', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    testCase(describe, test, expect);
  });
}
