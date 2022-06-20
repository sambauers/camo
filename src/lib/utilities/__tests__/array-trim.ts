import arrayTrim from '../array-trim.js'

const TRIMABLE = [
  '',
  false,
  undefined,
  null,
  'one',
  '',
  'two',
  false,
  'three',
  undefined,
  'four',
  null,
  'five',
  '',
  false,
  undefined,
  null,
]

describe('lib', () => {
  describe('utilities', () => {
    describe('arrayTrim()', () => {
      it('returns an array trimmed at the start', () => {
        expect(arrayTrim(TRIMABLE, 'start')).toStrictEqual([
          'one',
          '',
          'two',
          false,
          'three',
          undefined,
          'four',
          null,
          'five',
          '',
          false,
          undefined,
          null,
        ])
      })

      it('returns an array trimmed at the end', () => {
        expect(arrayTrim(TRIMABLE, 'end')).toStrictEqual([
          '',
          false,
          undefined,
          null,
          'one',
          '',
          'two',
          false,
          'three',
          undefined,
          'four',
          null,
          'five',
        ])
      })

      it('returns a trimmed array', () => {
        expect(arrayTrim(TRIMABLE)).toStrictEqual([
          'one',
          '',
          'two',
          false,
          'three',
          undefined,
          'four',
          null,
          'five',
        ])
      })
    })
  })
})
