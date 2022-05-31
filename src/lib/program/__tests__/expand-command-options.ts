import expandCommandOptions from '../expand-command-options'
import type * as Program from '../index.d'

const PROGRAM_OPTIONS: Program.OptionTuples = [
  ['value', 'accessToken', 'a'],
  ['value', 'environmentId', 'e', 'master'],
  ['variadic', 'list', 'l'],
  ['boolean', 'dry', 'd'],
]

describe('lib', () => {
  describe('program', () => {
    describe('expandCommandOptions()', () => {
      it('returns an expanded "value" command option without a fallback', () => {
        const option = PROGRAM_OPTIONS[0]
        expect(expandCommandOptions([option])).toStrictEqual({
          accessToken: {
            shortOption: '-a',
            longOption: '--access-token',
            allOptions: '-a, --access-token [accessToken]',
            english: 'Contentful access token',
            envVar: 'CONTENTFUL_MIGRATION_ACCESS_TOKEN',
            fallback: undefined,
            help: 'the target Contentful access token - over-rides the environment variable CONTENTFUL_MIGRATION_ACCESS_TOKEN',
          }
        })
      })

      it('returns an expanded "value" command option with a fallback', () => {
        const option = PROGRAM_OPTIONS[1]
        expect(expandCommandOptions([option])).toStrictEqual({
          environmentId: {
            shortOption: '-e',
            longOption: '--environment-id',
            allOptions: '-e, --environment-id [environmentId]',
            english: 'Contentful environment ID',
            envVar: 'CONTENTFUL_MIGRATION_ENVIRONMENT_ID',
            fallback: 'master',
            help: 'the target Contentful environment ID - over-rides the environment variable CONTENTFUL_MIGRATION_ENVIRONMENT_ID, defaults to "master" if not defined anywhere',
          }
        })
      })

      it('returns an expanded "variadic" command option', () => {
        const option = PROGRAM_OPTIONS[2]
        expect(expandCommandOptions([option])).toStrictEqual({
          list: {
            shortOption: '-l',
            longOption: '--list',
            allOptions: '-l, --list [list...]',
            english: 'Contentful list',
            envVar: 'CONTENTFUL_MIGRATION_LIST',
            fallback: undefined,
            help: 'the target Contentful list - over-rides the environment variable CONTENTFUL_MIGRATION_LIST',
          }
        })
      })

      it('returns an expanded "boolean" command option', () => {
        const option = PROGRAM_OPTIONS[3]
        expect(expandCommandOptions([option])).toStrictEqual({
          dry: {
            shortOption: '-d',
            longOption: '--dry',
            allOptions: '-d, --dry',
            english: 'Contentful dry',
            envVar: 'CONTENTFUL_MIGRATION_DRY',
            fallback: undefined,
            help: 'the target Contentful dry - over-rides the environment variable CONTENTFUL_MIGRATION_DRY',
          }
        })
      })

      it('returns an object containing expanded options', () => {
        expect(expandCommandOptions(PROGRAM_OPTIONS)).toStrictEqual({
          accessToken: expect.any(Object),
          environmentId: expect.any(Object),
          list: expect.any(Object),
          dry: expect.any(Object),
        })
      })
    })
  })
})
