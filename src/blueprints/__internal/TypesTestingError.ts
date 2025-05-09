import ansis from 'ansis';
import type { Compiler } from 'lib';
import ts from 'typescript';

/** @internal */
export class TypesTestingError extends Error {
  #original = {
    prepareStackTrace: Error.prepareStackTrace,
    stackTraceLimit: Error.stackTraceLimit
  };

  constructor(
    errors: Compiler.CompileResult['errors'],
    afterErrorFound: AfterErrorFound
  ) {
    super();
    this.#findError(errors, afterErrorFound);
  }

  #findError = (
    errors: Compiler.CompileResult['errors'],
    afterErrorFound: AfterErrorFound
  ) => {
    const trace = {} as {
      originalLine: number;
      originalColumn: number;
      stack: string;
    };

    Error.captureStackTrace(trace, this.constructor);

    for (const matches of trace.stack.matchAll(
      /^\s+at (?:(.*) )?(?:\(?(.*):(\d+):(\d+)\)?)$/gm
    )) {
      const [, , file, line, column] = matches;
      const key = `${ts.sys.resolvePath(file)}:${line}:${column}`;
      const errorFound = errors.get(key);

      if (errorFound) {
        this.name = 'TypesTestingError';
        this.#prepareMessage(errorFound);
        this.#prepareStack(errorFound);
        afterErrorFound(key, this);
        return;
      }
    }

    this.name = '';
    this.message = '';
    this.stack = undefined;
    this.cause = undefined;
  };

  #prepareMessage = (errorFound: Compiler.CompileResultError) => {
    const {
      expectCallExpressionText,
      assertionCallExpressionText,
      expectedType,
      receivedType,
      need2TypeArguments,
      isNegated
    } = errorFound;

    const expectTxt = expectCallExpressionText
      ? `${expectCallExpressionText}${receivedType ? `<${ansis.red('received')}>` : ''}()`
      : '';

    const assertionTxt = assertionCallExpressionText
      ? `${assertionCallExpressionText}${expectedType ? `<${ansis.green('expected')}>` : ''}()`
      : '';

    const title = (() => {
      if (expectTxt && assertionTxt) {
        return `${expectTxt}.${assertionTxt}`;
      }

      if (expectTxt) {
        return `${expectTxt}`;
      }

      if (assertionTxt) {
        return `${assertionTxt}`;
      }

      return '';
    })();

    const detail = (() => {
      if (!receivedType) {
        return 'Received type must be provided!\n';
      }

      if (!expectedType) {
        if (need2TypeArguments) {
          return 'Expected type must be provided!\n';
        }

        return `Received type: ${ansis.red(receivedType)}\n`;
      }

      return (
        `Expected type: ${isNegated ? 'not ' : ''}${ansis.green(expectedType)}\n` +
        `Received type: ${ansis.red(receivedType)}\n`
      );
    })();

    this.message = ansis.reset(`${title}\n\n${detail}`);
  };

  #prepareStack = (errorFound: Compiler.CompileResultError) => {
    Error.stackTraceLimit = Number.POSITIVE_INFINITY;
    Error.prepareStackTrace = (_, stackTraces) => {
      const index = stackTraces.findLastIndex((stack, index, stacks) => {
        const prev = stacks[index - 1];

        if (prev) {
          return (
            stack.getFileName() === errorFound.filePath ||
            stack.getScriptNameOrSourceURL() === errorFound.filePath
          );
        }

        return false;
      });

      if (index < 0) {
        return this.#original.prepareStackTrace?.(this, stackTraces);
      }

      const stack = stackTraces[index];

      return this.#original.prepareStackTrace?.(this, [stack]);
    };
    this.stack;
    Error.stackTraceLimit = this.#original.stackTraceLimit;
    Error.prepareStackTrace = this.#original.prepareStackTrace;
  };
}

/** @internal */
export type AfterErrorFound = (
  errorKey: string,
  TypesTestingError: TypesTestingError
) => void;
