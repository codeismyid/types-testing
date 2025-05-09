import ts from 'typescript';
import type { CompileOptions } from './compile';

const throwIfConfigError = (diagnostics?: readonly ts.Diagnostic[]) => {
  if (diagnostics && diagnostics.length > 0) {
    const errors = diagnostics.map(
      (error) => new Error(error.messageText as string)
    );

    throw new AggregateError(errors);
  }
};

/** @internal */
export const createProgram = (options: CompileOptions) => {
  const { basePath, tsConfig, compilerOptions, files, projectReferences } =
    options;

  if (basePath !== undefined && tsConfig !== undefined) {
    const tsConfigPath = ts.sys.resolvePath(`${basePath}/${tsConfig}`);
    const rawConfig: { config?: object; error?: ts.Diagnostic } =
      ts.readConfigFile(tsConfigPath, ts.sys.readFile);

    if (rawConfig.error) {
      throw new Error(
        `failed to read tsconfig file.\n${rawConfig.error.messageText as string}`
      );
    }

    const config = ts.parseJsonConfigFileContent(
      rawConfig.config,
      ts.sys,
      basePath,
      compilerOptions
    );

    throwIfConfigError(config.errors);

    if (files && files.length > 0) {
      config.fileNames = config.fileNames.concat(
        files.filter((file) => !config.fileNames.includes(file))
      );
    }

    if (compilerOptions) {
      config.options = { ...config.options, ...compilerOptions };
    }

    if (projectReferences && projectReferences.length > 0) {
      if (config.projectReferences && config.projectReferences.length > 0) {
        const existingPath = config.projectReferences.map((ref) => ref.path);
        config.projectReferences = [
          ...config.projectReferences,
          ...projectReferences.filter((ref) => !existingPath.includes(ref.path))
        ];
      } else {
        config.projectReferences = projectReferences;
      }
    }

    const program = ts.createProgram({
      rootNames: config.fileNames,
      options: config.options,
      projectReferences: config.projectReferences
    }) as Program;

    program.__internal = {
      files: program.getRootFileNames(),
      options: program.getCompilerOptions(),
      projectReferences: program.getProjectReferences()
    };

    return program;
  }

  if (compilerOptions !== undefined && files !== undefined) {
    const program = ts.createProgram({
      rootNames: files,
      options: compilerOptions,
      projectReferences: projectReferences
    }) as Program;

    throwIfConfigError(program.getOptionsDiagnostics());

    program.__internal = {
      files: program.getRootFileNames(),
      options: program.getCompilerOptions(),
      projectReferences: program.getProjectReferences()
    };

    return program;
  }

  throw new Error(
    'define basePath and tsConfig to implement configuration from tsconfig file\n' +
      'or define compilerOptions and files to implement configuration without tsconfig file.'
  );
};

/** @internal */
export type Program = ts.Program & {
  /** @internal */
  __internal: {
    /** @internal */
    files: readonly string[];
    /** @internal */
    options: ts.CompilerOptions;
    /** @internal */
    projectReferences?: readonly ts.ProjectReference[];
  };
};
