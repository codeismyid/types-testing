#!/usr/bin/env bun
import path from 'node:path';
import esbuild from 'esbuild';
import tscAlias from 'tsc-alias';
import tsconfig from 'tsconfig.json';
import ts from 'typescript';

type JsExt = '.js' | '.cjs' | '.mjs';
type TsExt = '.d.ts' | '.d.cts' | '.d.mts';
type BuildOutput = {
  list: {
    filePath: string;
    fileContents: string;
  }[];
  extension: JsExt | TsExt;
};

const { CI } = process.env;
const isCI = CI && ['1', 'true', 'yes', 'y'].includes(CI.toLowerCase());
if (isCI) {
  process.env.NO_COLOR = 'true';
}
const ansis = await import('ansis');

const outdir = 'dist';
const entryPoints = Array.from(
  new Bun.Glob('{src,lib,bin}/**/*.ts').scanSync({
    absolute: true,
    onlyFiles: true,
    throwErrorOnBrokenSymlink: true
  })
);

const resolveAlias = async (output: BuildOutput) => {
  const extension = ['.d.ts', '.d.cts', '.d.mts'].includes(output.extension)
    ? undefined
    : (output.extension as JsExt);
  const resolver = await tscAlias.prepareSingleFileReplaceTscAliasPaths({
    outDir: outdir,
    resolveFullPaths: Boolean(extension),
    resolveFullExtension: extension
  });

  for (const { fileContents, filePath } of output.list) {
    const resolved = resolver({
      fileContents,
      filePath
    });

    await Bun.write(filePath, resolved);
  }
};

const buildJs = async (
  format: esbuild.Format,
  ext?: BuildOutput['extension']
) => {
  const extension: BuildOutput['extension'] = ext ?? '.js';

  const result = await esbuild.build({
    format,
    entryPoints,
    outdir,
    target: ['es6'],
    packages: 'external',
    write: false,
    outExtension: {
      '.js': extension
    }
  });

  const list: BuildOutput['list'] = [];

  for (const out of result.outputFiles) {
    await Bun.write(out.path, out.contents);
    list.push({
      filePath: path.resolve(out.path),
      fileContents: out.text
    });
  }

  return {
    ...result,
    output: {
      extension,
      list
    }
  };
};

const buildDts = (ext?: BuildOutput['extension']) => {
  return new Promise<ts.EmitResult & { output: BuildOutput }>((resolve) => {
    const extension: BuildOutput['extension'] = ext ?? '.d.ts';
    const list: BuildOutput['list'] = [];
    const config = ts.parseJsonConfigFileContent(
      tsconfig,
      ts.sys,
      process.cwd(),
      {
        noEmit: false,
        declaration: true,
        emitDeclarationOnly: true,
        outDir: outdir
      }
    );
    const host = ts.createCompilerHost(config.options);
    const writeFile = host.writeFile;
    host.writeFile = (...arg) => {
      writeFile(...arg);
      const [filePath, fileContents] = arg;
      list.push({
        filePath: path.resolve(filePath),
        fileContents
      });
    };

    const program = ts.createProgram({
      host,
      rootNames: entryPoints,
      options: config.options
    });

    const emitted = program.emit();

    resolve({
      ...emitted,
      output: {
        extension,
        list
      }
    });
  });
};

const build = async (
  format: esbuild.Format | 'dts',
  ext?: BuildOutput['extension']
) => {
  console.info(`- ${format}`);
  let result: BuildOutput;

  switch (format) {
    case 'iife':
    case 'cjs':
    case 'esm': {
      result = (await buildJs(format, ext)).output;
      break;
    }
    case 'dts': {
      result = (await buildDts(ext)).output;
      break;
    }
    default: {
      throw new TypeError('invalid build format.');
    }
  }

  await resolveAlias(result);

  return result;
};

const main = async () => {
  console.info('build dist files...');
  const startTime = performance.now();
  await Promise.all([build('esm', '.js'), build('dts', '.d.ts')]);
  const endTime = performance.now();

  console.info(
    `\ndist script completed in ${ansis.bold(`${(endTime - startTime).toFixed(2)}ms`)}.`
  );
};

main().catch((err: unknown) => {
  throw err;
});
