import {
  isValidMigrationFilename,
  getMigrationBasename,
  getMigrationId,
} from '../utilities'

const VALID_MIGRATION_FILENAMES = [
  '0-description.ts',
  '0-description.js',
  '100-longer-description.ts',
  '100-longer-description.js',
  '2000-much-longer-description.ts',
  '2000-much-longer-description.js',
  '123-description-100-with-number.ts',
  '123-description-100-with-number.js',
]

const INVALID_MIGRATION_FILENAMES = [
  'no-id.ts',
  'no-id.js',
  '100.ts',
  '100.js',
  '200-wrong-extension.tt',
]

const VALID_MIGRATIONS = VALID_MIGRATION_FILENAMES.map((filename) => ({
  filename,
}))

const INVALID_MIGRATIONS = INVALID_MIGRATION_FILENAMES.map((filename) => ({
  filename,
}))

describe('api', () => {
  describe('migrations', () => {
    describe('utilities', () => {
      describe('isValidMigrationFilename()', () => {
        it('returns true when filename is valid', () => {
          VALID_MIGRATION_FILENAMES.forEach((filename) => {
            expect(isValidMigrationFilename(filename)).toBe(true)
          })
        })

        it('returns false when filename is invalid', () => {
          INVALID_MIGRATION_FILENAMES.forEach((filename) => {
            expect(isValidMigrationFilename(filename)).toBe(false)
          })
        })

        it('returns true when migration filename is valid', () => {
          VALID_MIGRATIONS.forEach((migration) => {
            expect(isValidMigrationFilename(migration)).toBe(true)
          })
        })

        it('returns false when migration filename is invalid', () => {
          INVALID_MIGRATIONS.forEach((migration) => {
            expect(isValidMigrationFilename(migration)).toBe(false)
          })
        })
      })

      describe('getMigrationBasename()', () => {
        it('returns the basename', () => {
          expect(getMigrationBasename('/foo/bar/0-description.ts')).toBe(
            '0-description'
          )
        })
      })

      describe('getMigrationId()', () => {
        it('returns the id if found', () => {
          expect(getMigrationId('0-description.ts')).toBe(0)
          expect(getMigrationId('123-description-100-test.ts')).toBe(123)
        })
      })
    })
  })
})
