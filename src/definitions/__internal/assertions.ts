import type { AssertionsBuiltIn as PublicAssertions } from '../assertions';
import type { NotProvided } from './not-provided';

declare const __typesTesting_expectCall: unique symbol;
declare const __typesTesting_assertionCall: unique symbol;

/** @internal */
export interface Assertions<Received = NotProvided>
  extends AssertionsBuiltIn<Received> {}

/** @internal */
export type AssertionsBuiltIn<
  Received = NotProvided,
  Assertions extends PublicAssertions = PublicAssertions<Received>,
  State extends AssertionState = AssertionState.Normal
> = {
  [Key in keyof Assertions]: Key extends 'not'
    ? AssertionsBuiltIn<Received, Assertions[Key], AssertionStateNext<State>>
    : AssertionFn<Key, State, Received>;
} & {
  [__typesTesting_expectCall]: Received;
};

/** @internal */
export enum AssertionState {
  Normal = 0,
  Negated = -1
}

type AssertionStateNext<State extends AssertionState> =
  State extends AssertionState.Negated
    ? AssertionState.Normal
    : AssertionState.Negated;

type AssertionNeedTypeArgument =
  | 'toBe'
  | 'toEqual'
  | 'toStrictEqual'
  | 'toExtends'
  | 'toAssignable'
  | 'toCompatible'
  | 'toExtendsMutually'
  | 'toAssignableMutually'
  | 'toMutual'
  | 'toExtendsEitherWay'
  | 'toAssignableEitherWay'
  | 'toRelate';

type Asserts<Name, State, Received = NotProvided, Expected = NotProvided> = {
  [__typesTesting_assertionCall]: {
    assertionName: Name;
    assertionState: State;
    receivedType: Received;
    expectedType: Expected;
  };
};

type AssertionFn<
  AssertionName,
  Negated,
  Received = NotProvided
> = AssertionName extends Exclude<keyof PublicAssertions<Received>, 'not'>
  ? (
      AssertionName extends AssertionNeedTypeArgument
        ? <Expected = NotProvided>(
            expected?: Expected
          ) => Asserts<AssertionName, Negated, Received, Expected>
        : () => Asserts<AssertionName, Negated, Received, NotProvided>
    ) extends infer Fn extends CallableFunction
    ? Fn
    : never
  : never;
