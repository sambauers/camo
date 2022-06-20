import getErrorMessage from '../get-error-message.js'

describe('lib', () => {
  describe('utilities', () => {
    describe('getErrorMessage()', () => {
      it('returns the message from a standard error', () => {
        expect(getErrorMessage(new Error('The error message'))).toBe(
          'The error message'
        )
      })

      it('returns the message from a standard object', () => {
        expect(
          getErrorMessage({
            id: 100,
            attribute: true,
            message: 'The error message',
          })
        ).toBe('The error message')
      })

      it('returns the provided parameter if it is a string', () => {
        expect(getErrorMessage('The error message')).toBe('The error message')
      })

      it('returns the provided parameter stringified if it is not a string', () => {
        expect(getErrorMessage(true)).toBe('true')
        expect(getErrorMessage(123)).toBe('123')
        expect(
          getErrorMessage({
            one: 1,
            two: 2,
            three: 3,
          })
        ).toBe('{"one":1,"two":2,"three":3}')
      })

      it('returns the provided parameter as a string if it fails to strigify', () => {
        const stringifySpy = jest
          .spyOn(JSON, 'stringify')
          .mockImplementationOnce(() => {
            throw new Error('Mock error')
          })

        expect(
          getErrorMessage({
            one: 1,
            two: 2,
            three: 3,
          })
        ).toBe('[object Object]')

        stringifySpy.mockRestore()
      })
    })
  })
})
