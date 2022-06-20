import arrayPad from '../array-pad.js'

describe('lib', () => {
  describe('utilities', () => {
    describe('arrayPad()', () => {
      it('returns an array with padding at the start', () => {
        expect(
          arrayPad(['one', 'two', 'three'], 'start', 5, 'before')
        ).toStrictEqual(['before', 'before', 'one', 'two', 'three'])
      })

      it('returns an array with padding at the end', () => {
        expect(
          arrayPad(['one', 'two', 'three'], 'end', 5, 'after')
        ).toStrictEqual(['one', 'two', 'three', 'after', 'after'])
      })

      it('returns a copy of the original array when length equals original length', () => {
        expect(
          arrayPad(['one', 'two', 'three'], 'start', 3, 'before')
        ).toStrictEqual(['one', 'two', 'three'])
      })

      it('returns a copy of the original array when length is less than original length', () => {
        expect(
          arrayPad(['one', 'two', 'three'], 'start', 1, 'before')
        ).toStrictEqual(['one', 'two', 'three'])
      })
    })
  })
})
