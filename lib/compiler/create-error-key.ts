/** @internal */
export function createErrorKey(filePath: string, line: number, column: number) {
  return `${filePath}:${line}:${column}`;
}
