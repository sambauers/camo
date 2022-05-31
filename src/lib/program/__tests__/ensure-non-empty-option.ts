import ensureNonEmptyOption from '../ensure-non-empty-option'
import expandCommandOptions from '../expand-command-options'
import * as exit from '../exit'

import type * as Program from '../index.d'

const MOCK_OPTION_INSTANCES: Program.IOptionInstances = {
  accessToken: 'abc123',
  spaceId: '',
  environmentId: undefined,
}

const MOCK_OPTIONS = expandCommandOptions([
  ['value', 'accessToken', 'a'],
  ['value', 'spaceId', 's'],
  ['value', 'environmentId', 'e', 'master'],
])

describe('lib', () => {
  describe('program', () => {
    describe('ensureNonEmptyOption()', () => {
      const exitSpy = jest.spyOn(exit, 'default').mockImplementation()
      const processExitSpy = jest.spyOn(process, 'exit').mockImplementation()

      beforeEach(() => {
        exitSpy.mockClear()
        processExitSpy.mockClear()
      })

      afterAll(() => {
        exitSpy.mockRestore()
        processExitSpy.mockRestore()
      })

      it('returns void if option is present', () => {
        expect(
          ensureNonEmptyOption(
            { ...MOCK_OPTION_INSTANCES },
            { ...MOCK_OPTIONS },
            'environmentId',
            100
          )
        ).toBeUndefined()
        expect(exitSpy).not.toBeCalled()
        expect(processExitSpy).not.toBeCalled()
      })

      it('returns void if option is not present and fallback default exists', () => {
        expect(
          ensureNonEmptyOption(
            { ...MOCK_OPTION_INSTANCES },
            { ...MOCK_OPTIONS },
            'accessToken',
            101
          )
        ).toBeUndefined()
        expect(exitSpy).not.toBeCalled()
        expect(processExitSpy).not.toBeCalled()
      })

      it('returns void if option is not present and fallback environment variable exists', () => {
        process.env.CONTENTFUL_MIGRATION_SPACE_ID = 'abc123'

        expect(
          ensureNonEmptyOption(
            { ...MOCK_OPTION_INSTANCES },
            { ...MOCK_OPTIONS },
            'spaceId',
            102
          )
        ).toBeUndefined()
        expect(exitSpy).not.toBeCalled()
        expect(processExitSpy).not.toBeCalled()

        delete process.env.CONTENTFUL_MIGRATION_SPACE_ID
      })

      it('exits if option is not present and no fallback deafult exists', () => {
        expect(
          ensureNonEmptyOption(
            { ...MOCK_OPTION_INSTANCES },
            { ...MOCK_OPTIONS },
            'spaceId',
            103
          )
        ).toBeUndefined()
        expect(exitSpy).toBeCalledWith(
          expect.objectContaining({
            title: 'No Contentful space ID specified',
            message: expect.stringContaining(
              'environment variable CONTENTFUL_MIGRATION_SPACE_ID'
            ),
          })
        )
        expect(processExitSpy).toBeCalledWith(103)
      })
    })
  })
})
