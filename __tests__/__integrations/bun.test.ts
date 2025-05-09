import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import * as Ansis from 'ansis';
import { testCase } from './test-case';

describe('bun', () => {
  const originalAnsis = { ...Ansis };

  beforeEach(() => {
    mock.module('ansis', () => {
      return {
        ...originalAnsis,
        default: {
          ...originalAnsis.default,
          red: mock((str: string) => str),
          green: mock((str: string) => str),
          reset: mock((str: string) => str)
        }
      };
    });
  });

  afterEach(() => {
    mock.module('ansis', () => {
      return {
        ...originalAnsis
      };
    });
  });

  testCase(describe, test, expect);
});
