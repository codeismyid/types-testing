/** @internal */
export const createErrorKey = (
  filePath: string,
  line: number,
  column: number
) => {
  return `${filePath}:${line}:${column}`;
};
