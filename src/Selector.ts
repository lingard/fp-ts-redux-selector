import { Applicative2, getApplicativeMonoid } from 'fp-ts/Applicative'
import { bindTo as bindTo_, Functor2 } from 'fp-ts/Functor'
import { bind as bind_, Chain2 } from 'fp-ts/Chain'
import { Apply2, apS as apS_, getApplySemigroup } from 'fp-ts/Apply'
import { Monad2 } from 'fp-ts/Monad'
import { constant, identity, pipe } from 'fp-ts/function'
import { Lens } from 'monocle-ts/Lens'
import { Pointed2 } from 'fp-ts/Pointed'
import { Semigroup } from 'fp-ts/Semigroup'
import { Monoid } from 'fp-ts/Monoid'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.1.0
 */
export interface Selector<State, A> {
  (s: State): A
}

/**
 * @category model
 * @since 0.1.0
 */
export const URI = 'fp-ts-redux-selector/Selector'

/**
 * @category model
 * @since 0.1.0
 */
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind2<E, A> {
    [URI]: Selector<E, A>
  }
}

// -------------------------------------------------------------------------------------
// non-pipleables
// -------------------------------------------------------------------------------------

const _chain =
  <State, A, B>(
    fa: Selector<State, A>,
    f: (a: A) => Selector<State, B>
  ): Selector<State, B> =>
  (state: State) =>
    pipe(fa(state), f)(state)

const _ap =
  <State, A, B>(
    fab: Selector<State, (a: A) => B>,
    fa: Selector<State, A>
  ): Selector<State, B> =>
  (state: State) =>
    pipe(fa(state), fab(state))

const _map =
  <State, A, B>(fa: Selector<State, A>, ab: (a: A) => B) =>
  (s: State): B =>
    pipe(fa(s), ab)

// -------------------------------------------------------------------------------------
// instance operations
// -------------------------------------------------------------------------------------

/**
 * @category Pointed
 * @since 0.1.0
 */
export const of: Pointed2<URI>['of'] = constant

/**
 * @category Functor
 * @since 0.1.0
 */
export const map: <State, A, B>(
  f: (a: A) => B
) => (fa: Selector<State, A>) => Selector<State, B> = (f) => (fa) => _map(fa, f)

/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 2.8.0
 */
export const apW: <S2, A>(
  fa: Selector<S2, A>
) => <S1, B>(fab: Selector<S1, (a: A) => B>) => Selector<S1 & S2, B> =
  (fa) => (fab) => (r) =>
    fab(r)(fa(r))

/**
 * @category instance operations
 * @since 0.1.0
 */
export const ap: <State, A, B>(
  fa: Selector<State, A>
) => (fab: Selector<State, (a: A) => B>) => Selector<State, B> =
  (fa) => (fab) =>
    _ap(fab, fa)

/**
 * @category Monad
 * @since 0.1.0
 */
export const chain: <State, A, B>(
  f: (a: A) => Selector<State, B>
) => (ma: Selector<State, A>) => Selector<State, B> = (f) => (ma) =>
  _chain(ma, f)

/**
 * @category Monad
 * @since 0.1.0
 */
export const chainW: <S2, A, B>(
  f: (a: A) => Selector<S2, B>
) => <S>(ma: Selector<S, A>) => Selector<S & S2, B> = (f) => (ma) =>
  _chain(ma, f as any)

/**
 * @category combinators
 * @since 0.1.0
 */
export const flattenW: <S1, S2, A>(
  mma: Selector<S1, Selector<S2, A>>
) => Selector<S1 & S2, A> = chainW(identity)

/**
 * @category combinatorss
 * @since 0.1.0
 */
export const flatten: <S, A>(
  mma: Selector<S, Selector<S, A>>
) => Selector<S, A> = flattenW

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.1.0
 */
export const select: <S, A>(f: (s: S) => A) => Selector<S, A> = identity

/**
 * @category constructors
 * @since 0.1.0
 */
export const fromLens = <S, A>(lens: Lens<S, A>): Selector<S, A> => lens.get

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 0.1.0
 */
export const Functor: Functor2<URI> = {
  URI,
  map: _map
}

/**
 * @category instances
 * @since 0.1.0
 */
export const Apply: Apply2<URI> = {
  ...Functor,
  ap: _ap
}

/**
 * @category instances
 * @since 0.1.0
 */
export const Applicative: Applicative2<URI> = {
  ...Apply,
  of
}

/**
 * @category instances
 * @since 0.1.0
 */
export const Chain: Chain2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain
}

/**
 * @category instances
 * @since 0.1.0
 */
export const Monad: Monad2<URI> = {
  ...Applicative,
  chain: _chain
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 0.1.0
 */
export const bindTo = bindTo_(Functor)

/**
 * @since 0.1.0
 */
export const bind = bind_(Chain)

/**
 * @since 0.1.0
 */
export const bindW: <N extends string, A, S2, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => Selector<S2, B>
) => <S1>(
  fa: Selector<S1, A>
) => Selector<
  S1 & S2,
  { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }
> = bind as any

// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------

/**
 * @since 0.1.0
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const Do: Selector<unknown, {}> = of({})

/**
 * @since 0.1.0
 */
export const apS =
  /*#__PURE__*/
  apS_(Apply)

/**
 * @since 0.1.0
 */
export const apSW: <A, N extends string, S2, B>(
  name: Exclude<N, keyof A>,
  fb: Selector<S2, B>
) => <S1>(
  fa: Selector<S1, A>
) => Selector<
  S1 & S2,
  { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }
> = apS as any

/**
 * @category instances
 * @since 0.1.0
 */
export const selector: Applicative2<URI> & Monad2<URI> = {
  URI,
  of,
  ap: _ap,
  chain: _chain,
  map: _map
}

/**
 * @category instances
 * @since 0.1.0
 */
export const getSemigroup: <S, A>(
  S: Semigroup<A>
) => Semigroup<Selector<S, A>> = getApplySemigroup(Apply)

/**
 * @category instances
 * @since 0.1.0
 */
export const getMonoid: <R, A>(M: Monoid<A>) => Monoid<Selector<R, A>> =
  getApplicativeMonoid(Applicative)
