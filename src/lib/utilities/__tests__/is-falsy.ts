import isFalsy from '../is-falsy.js'

describe('lib', () => {
  describe('utilities', () => {
    describe('isFalsy()', () => {
      it('returns true when passed undefined', () => {
        expect(isFalsy(undefined)).toBe(true)
      })

      it('returns true when passed false', () => {
        expect(isFalsy(false)).toBe(true)
      })

      it('returns true when passed an empty string', () => {
        expect(isFalsy('')).toBe(true)
      })

      it('returns true when passed null', () => {
        expect(isFalsy(null)).toBe(true)
      })

      it('returns false when passed a string', () => {
        expect(isFalsy('a_string')).toBe(false)
      })

      it('returns false when passed a number', () => {
        expect(isFalsy(123)).toBe(false)
      })

      it('returns false when passed zero', () => {
        expect(isFalsy(0)).toBe(false)
      })
    })
  })
})
