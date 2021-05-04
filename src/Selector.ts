import { Applicative2 } from 'fp-ts/Applicative'
import { Functor2 } from 'fp-ts/Functor'
import { Apply2 } from 'fp-ts/Apply'
import { Monad2 } from 'fp-ts/Monad'
import { identity } from 'fp-ts/function'
import { Lens } from 'monocle-ts/Lens'

export type Selector<State, A> = (s: State) => A

export const URI = 'Selector'
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind2<E, A> {
    [URI]: Selector<E, A>
  }
}

/**
 * non-pipeables
 */
const _of = <_, A>(a: A) => {
  return () => a
}

const _chain = <State, A, B>(
  fa: Selector<State, A>,
  f: (a: A) => Selector<State, B>
): Selector<State, B> => {
  return (state: State) => {
    const a = fa(state)
    const fb = f(a)

    return fb(state)
  }
}

const _ap = <State, A, B>(
  abSelector: Selector<State, (a: A) => B>,
  aSelector: Selector<State, A>
): Selector<State, B> => (state: State) => {
  const ab = abSelector(state)
  const a = aSelector(state)

  return ab(a)
}

const _map = <State, A, B>(aSelector: Selector<State, A>, ab: (a: A) => B) => (
  state: State
) => {
  const a = aSelector(state)
  const b = ab(a)

  return b
}

/**
 * type class members
 */
export const map: <State, A, B>(
  f: (a: A) => B
) => (fa: Selector<State, A>) => Selector<State, B> = (f) => (fa) => _map(fa, f)

export const ap: <State, A, B>(
  fa: Selector<State, A>
) => (fab: Selector<State, (a: A) => B>) => Selector<State, B> = (fa) => (
  fab
) => _ap(fab, fa)

export const chain: <State, A, B>(
  f: (a: A) => Selector<State, B>
) => (ma: Selector<State, A>) => Selector<State, B> = (f) => (ma) =>
  _chain(ma, f)

export const chainW: <State, A, B>(
  f: (a: A) => Selector<State, B>
) => <State2>(ma: Selector<State2, A>) => Selector<State & State2, B> = (f) => (
  ma
  // TODO: Fix this return type
) => _chain(ma, f as any)

export const flatten: <State, A>(
  mma: Selector<State, Selector<State, A>>
) => Selector<State, A> = chain(identity)

export const of = _of

/**
 * constructors
 */
export const fromLens = <S, A>(lens: Lens<S, A>): Selector<S, A> => lens.get

/**
 * instances
 */
export const Functor: Functor2<URI> = {
  URI,
  map: _map
}

export const Apply: Apply2<URI> = {
  ...Functor,
  ap: _ap
}

export const Applicative: Applicative2<URI> = {
  ...Apply,
  of: _of
}

export const Monad: Monad2<URI> = {
  ...Applicative,
  chain: _chain
}

export const selector: Applicative2<URI> & Monad2<URI> = {
  URI,
  of: _of,
  ap: _ap,
  chain: _chain,
  map: _map
}
