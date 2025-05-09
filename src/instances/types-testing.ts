import { TypesTesting } from 'src/blueprints';

const typesTesting = new TypesTesting({
  basePath: process.cwd(),
  tsConfig: 'tsconfig.json'
});

export const { expectType, prepare, reset } = typesTesting;
export default typesTesting;
