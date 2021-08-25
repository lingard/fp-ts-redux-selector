import { deepStrictEqual } from 'assert'

import { pipe } from 'fp-ts/function'


import * as _ from '../src/Selector'

const double = (n: number): number => n * 2

describe('Selector', () => {
  describe('pipeables', () => {
    it('map', () => {
      deepStrictEqual(pipe(_.of(1), _.map(double))({}), 2)
    })

    it('ap', () => {
      deepStrictEqual(pipe(_.of(double), _.ap(_.of(1)))({}), 2)
    })

    it('chain', () => {
      const f = (s: string): _.Selector<unknown, number> => _.of(s.length)

      deepStrictEqual(pipe(_.of('foo'), _.chain(f))({}), 3)
    })

    it('flatten', () => {
      deepStrictEqual(pipe(_.of(_.of('a')), _.flatten)({}), 'a')
    })


    type S1 = { readonly s1: unknown }
    type S2 = { readonly s2: unknown }

    it('flattenW', () => {
      deepStrictEqual(pipe(_.of<S1, _.Selector<S2, 'a'>>(_.of('a')), _.flattenW)({ s1: '', s2: '' }), 'a')
    })

  })
})
