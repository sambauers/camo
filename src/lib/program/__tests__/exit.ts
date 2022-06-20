import exit from '../exit.js'

describe('lib', () => {
  describe('program', () => {
    describe('exit()', () => {
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      beforeEach(() => {
        consoleInfoSpy.mockClear()
        consoleErrorSpy.mockClear()
      })

      afterAll(() => {
        consoleInfoSpy.mockRestore()
        consoleErrorSpy.mockRestore()
      })

      it('prints empty info to console', () => {
        expect(consoleInfoSpy).toBeCalledTimes(0)
        expect(exit()).toBeUndefined()
        expect(consoleInfoSpy).toBeCalledTimes(2)
        expect(consoleInfoSpy).toBeCalledWith('')
      })

      it('prints info to console when passed a message', () => {
        expect(consoleInfoSpy).toBeCalledTimes(0)
        expect(exit({ message: 'This is a message' })).toBeUndefined()
        expect(consoleInfoSpy).toBeCalledTimes(3)
        expect(consoleInfoSpy).toBeCalledWith('')
        expect(consoleInfoSpy).toBeCalledWith('This is a message')
      })

      it('ignores an empty message', () => {
        expect(consoleInfoSpy).toBeCalledTimes(0)
        expect(exit({ message: '' })).toBeUndefined()
        expect(consoleInfoSpy).toBeCalledTimes(2)
        expect(consoleInfoSpy).toBeCalledWith('')
      })

      it('prints error to console when passed a title', () => {
        expect(consoleErrorSpy).toBeCalledTimes(0)
        expect(exit({ title: 'This is a title' })).toBeUndefined()
        expect(consoleErrorSpy).toBeCalledTimes(1)
        expect(consoleErrorSpy).toBeCalledWith(expect.stringContaining('Error'))
        expect(consoleErrorSpy).toBeCalledWith(
          expect.stringContaining('This is a title')
        )
      })

      it('ignores an empty title', () => {
        expect(consoleErrorSpy).toBeCalledTimes(0)
        expect(exit({ title: '' })).toBeUndefined()
        expect(consoleErrorSpy).toBeCalledTimes(1)
        expect(consoleErrorSpy).toBeCalledWith(expect.stringContaining('Error'))
        expect(consoleErrorSpy).not.toBeCalledWith(
          expect.stringContaining(' - ')
        )
      })
    })
  })
})
