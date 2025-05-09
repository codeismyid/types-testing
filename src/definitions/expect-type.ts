import type { NotProvided } from './__internal/not-provided';
import type { Assertions } from './assertions';

/**
 * Returns assertion functions for checking types.
 */
export type ExpectType =
  /**
   * @template Received The received type.
   * @param received The received value (only the value type will be used).
   * @returns Set of assertions object.
   */
  <Received = NotProvided>(received?: Received) => Assertions<Received>;
