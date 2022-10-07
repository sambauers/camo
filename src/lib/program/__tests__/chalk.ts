import chalk from '../chalk.js'

const reset = (input: string) => `\u001B[0m${input}\u001B[0m`

describe('lib', () => {
  describe('program', () => {
    describe('chalk', () => {
      describe('heading()', () => {
        it('returns the provided string in the correct format', () => {
          expect(chalk.heading('heading')).toEqual(reset('\u001B[4mheading\u001B[24m'))
        })
      })

      describe('dim()', () => {
        it('returns the provided string in the correct format', () => {
          expect(chalk.dim('dim')).toEqual(reset('\u001B[2mdim\u001B[22m'))
        })
      })

      describe('error()', () => {
        it('returns the provided string in the correct format', () => {
          expect(chalk.error('error')).toEqual(reset('\u001B[101m\u001B[38;5;231merror\u001B[39m\u001B[49m'))
        })
      })

      describe('warning()', () => {
        it('returns the provided string in the correct format', () => {
          expect(chalk.warning('warning')).toEqual(reset('\u001B[48;5;208m\u001B[38;5;231mwarning\u001B[39m\u001B[49m'))
        })
      })

      describe('success()', () => {
        it('returns the provided string in the correct format', () => {
          expect(chalk.success('success')).toEqual(reset('\u001B[42m\u001B[38;5;231msuccess\u001B[39m\u001B[49m'))
        })
      })

      describe('emphasise()', () => {
        it('returns the provided string in the correct format', () => {
          expect(chalk.emphasise('emphasise')).toEqual(reset('\u001B[4memphasise\u001B[24m'))
        })
      })
    })
  })
})
