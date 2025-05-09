import { Assertion, Compiler } from 'lib';
import type { Assertions } from 'src/definitions/__internal/assertions';
import type { NotProvided } from 'src/definitions/__internal/not-provided';
import type ts from 'typescript';
import { TypesTestingError } from './__internal/TypesTestingError';

/**
 * Blueprint class for types-testing implementation.
 */
export class TypesTesting {
  #options: TypesTestingOptions;
  #compileResult?: Compiler.CompileResult;
  #assertions!: Assertions;

  /**
   * Creates a new types-testing instance.
   *
   * @param options Options for types-testing instance.
   */
  constructor(options: TypesTestingOptions) {
    this.prepare = this.prepare.bind(this);
    this.reset = this.reset.bind(this);
    this.expectType = this.expectType.bind(this);

    this.#options = {
      autoPrepare: options.autoPrepare ?? true,
      basePath: options.basePath,
      tsConfig: options.tsConfig,
      files: options.files,
      compilerOptions: options.compilerOptions,
      projectReferences: options.projectReferences
    };

    this.#assertions = new Proxy(Assertion, {
      get: () => {
        const assertionFn = () => {
          if (!this.#compileResult) {
            return;
          }

          const errors = this.#compileResult.errors;
          new TypesTestingError(errors, (key, TypesTestingError) => {
            errors.delete(key);
            throw TypesTestingError;
          });
        };

        return assertionFn;
      }
    }) as unknown as Assertions;
  }

  /**
   * Checks if the types-testing instance is ready (prepared).
   */
  get isPrepared() {
    return this.#compileResult !== undefined;
  }

  /**
   * Gets the current configuration options.
   */
  get options() {
    return this.#options;
  }

  /**
   * Prepares the types-testing instance.
   *
   * @param options Optional options to override instance options.
   * @throws If the `tsconfig.json` file can't be found.
   */
  prepare(options?: Partial<Omit<TypesTestingOptions, 'autoPrepare'>>) {
    if (this.isPrepared) {
      return this;
    }

    this.#compileResult = Compiler.compile({
      ...this.#options,
      ...options
    } as Compiler.CompileOptions);

    return this;
  }

  /**
   * Reset the types-testing instance.
   *
   * Will do nothing if the types-testing instance is not prepared.
   *
   * @param runPrepare Optional boolean flag to specify whether to run {@link prepare} after reset.
   */
  reset(runPrepare?: boolean) {
    if (!this.isPrepared) {
      return;
    }

    this.#compileResult = undefined;

    if (runPrepare) {
      this.prepare();
    }
  }

  /**
   * Returns assertion functions for checking types.
   *
   * @template Received The received type.
   * @param received The received value (only the value type will be used).
   * @returns Set of assertions object.
   * @throws If the tester isn't prepared (i.e., `prepare()` hasn't been called yet).
   */
  expectType<Received = NotProvided>(
    // @ts-expect-error: intended (only the value type will be used)
    received?: Received
  ) {
    const notPrepared = !this.isPrepared;

    if (notPrepared) {
      const { autoPrepare } = this.options;

      if (autoPrepare) {
        this.prepare();
      } else {
        throw new Error('need to run prepare first.');
      }
    }

    const errors = (this.#compileResult as Compiler.CompileResult).errors;
    new TypesTestingError(errors, (key, TypesTestingError) => {
      errors.delete(key);
      throw TypesTestingError;
    });

    return {
      ...this.#assertions,
      not: {
        ...this.#assertions
      }
    } as unknown as Assertions<Received>;
  }
}

/**
 * Options for types-testing instance creation.
 */
export type TypesTestingOptions = {
  /**
   * Whether to run prepare when the `expectType` function is first called. Defaults to `true`.
   *
   * **Note**:
   *
   * It's better to run prepare manually
   * if `expectType` is called inside test suite to prevent test timeout.
   */
  autoPrepare?: boolean;
  /**
   * Define the base path.
   *
   * Optional if directly using `compilerOptions` and `files`.
   */
  basePath?: string;
  /**
   * Define the name of tsconfig file.
   *
   * Optional if directly using `compilerOptions` and `files`.
   */
  tsConfig?: string;
  /**
   * Define typescript compiler options or extends typescript compiler options from tsconfig file.
   *
   * Optional if using `basePath` and `tsConfig`.
   */
  compilerOptions?: Partial<ts.CompilerOptions>;
  /**
   * Define typescript included files or extends included files from tsconfig file.
   *
   * Optional if using `basePath` and `tsConfig`.
   */
  files?: readonly string[];
  /**
   * Define typescript project references or extends project references from tsconfig file.
   *
   * Always optional.
   */
  projectReferences?: readonly ts.ProjectReference[];
};
