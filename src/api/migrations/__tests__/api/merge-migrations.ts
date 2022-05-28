import { join } from 'path'
import migrations from '../../index'

const MIGRATIONS_DIR = join(__dirname, '../../__fixtures__/migrations')

describe('api', () => {
  describe('migrations', () => {
    describe('mergeMigrations()', () => {
      const migrationsApi = migrations({ localDirectory: MIGRATIONS_DIR })
      const migration = migrationsApi.expandMigration({
        filename: '100-description.ts',
      })
      const migrationLocal = migrationsApi.expandMigration({
        filename: '100-description.ts',
        local: true,
      })
      const migrationRegistered = migrationsApi.expandMigration({
        filename: '100-description.ts',
        registered: true,
        appliedAt: '2022-05-25T11:18:46+1000',
        appliedAtFormatted: 'Wed, 25 May 2022, 11:18:46 AEST',
      })
      const migrationLocalRegistered = migrationsApi.expandMigration({
        filename: '100-description.ts',
        local: true,
        registered: true,
        appliedAt: '2022-05-25T11:18:46+1000',
        appliedAtFormatted: 'Wed, 25 May 2022, 11:18:46 AEST',
      })
      const migrationRequested = migrationsApi.expandMigration({
        filename: '100-description.ts',
        requested: true,
      })

      it('returns undefined when base and migration are both undefined', () => {
        expect(
          migrationsApi.mergeMigrations(undefined, undefined)
        ).toBeUndefined()
      })

      it('returns migration when base is undefined', () => {
        expect(
          migrationsApi.mergeMigrations(undefined, migration)
        ).toStrictEqual(migration)
      })

      it('returns base when migration is undefined', () => {
        expect(
          migrationsApi.mergeMigrations(migration, undefined)
        ).toStrictEqual(migration)
      })

      it('merges registered into local migration', () => {
        expect(
          migrationsApi.mergeMigrations(migrationLocal, migrationRegistered)
        ).toStrictEqual(migrationLocalRegistered)
      })

      it('merges local into registered migration', () => {
        expect(
          migrationsApi.mergeMigrations(migrationRegistered, migrationLocal)
        ).toStrictEqual(migrationLocalRegistered)
      })

      it('merges into requested migration', () => {
        expect(
          migrationsApi.mergeMigrations(migration, migrationRequested)
        ).toStrictEqual(migrationRequested)
      })
    })
  })
})
