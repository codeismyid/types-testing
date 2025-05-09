import { type JestConfigWithTsJest, createJsWithTsEsmPreset } from 'ts-jest';

const presetConfig = createJsWithTsEsmPreset({
  tsconfig: '__tests__/__example/tsconfig.jest.json'
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
  rootDir: '../..',
  moduleNameMapper: {
    '^src$': '<rootDir>/src',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^lib$': '<rootDir>/lib',
    '^lib/(.*)$': '<rootDir>/lib/$1',
    '^tsconfig.json$': '<rootDir>/tsconfig.json',
    '^package.json$': '<rootDir>/package.json'
  }
};

export default jestConfig;
