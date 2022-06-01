import { join } from 'path'
import migrations from '../../index'
import type * as Migrations from '../../index.d'

const MIGRATIONS_DIR = join(__dirname, '../../__fixtures__/migrations')
const MIGRATION_100: Migrations.IMigration = {
  filename: '100-one.ts',
  basename: '100-one',
  id: 100,
  local: true,
  registered: false,
  requested: false,
  path: join(__dirname, '../../__fixtures__/migrations/100-one.ts'),
}
const MIGRATION_100_REGISTERED: Migrations.IMigration = {
  filename: '100-one.ts',
  basename: '100-one',
  id: 100,
  local: false,
  registered: true,
  requested: false,
  appliedAt: '2022-06-01T10:00:00+1000',
  appliedAtFormatted: 'Wed, 01 Jun 2022, 10:00:00 AEST',
}
const MIGRATION_200: Migrations.IMigration = {
  filename: '200-two.ts',
  basename: '200-two',
  id: 200,
  local: true,
  registered: false,
  requested: false,
  path: join(__dirname, '../../__fixtures__/migrations/200-two.ts'),
}
const MIGRATION_200_REQUESTED: Migrations.IMigration = {
  filename: '200-two.ts',
  basename: '200-two',
  id: 200,
  local: false,
  registered: false,
  requested: true,
}
const MIGRATION_300: Migrations.IMigration = {
  filename: '300-three.ts',
  basename: '300-three',
  id: 300,
  local: false,
  registered: true,
  requested: false,
  appliedAt: '2022-06-01T10:00:00+1000',
  appliedAtFormatted: 'Wed, 01 Jun 2022, 10:00:00 AEST',
}
const MIGRATION_400: Migrations.IMigration = {
  filename: '400-four.ts',
  basename: '400-four',
  id: 400,
  local: false,
  registered: true,
  requested: false,
  appliedAt: '2022-06-01T10:00:00+1000',
  appliedAtFormatted: 'Wed, 01 Jun 2022, 10:00:00 AEST',
}
const MIGRATIONS_TO_MERGE_ADDITIVE: Array<Migrations.IMigration> = [
  MIGRATION_300,
  MIGRATION_400,
]
const MIGRATIONS_TO_MERGE_UNORDERED: Array<Migrations.IMigration> = [
  MIGRATION_400,
  MIGRATION_300,
]

describe('api', () => {
  describe('migrations', () => {
    describe('mergeData()', () => {
      it('merges the provided migrations into the stored data', () => {
        const migrationsApi = migrations({ localDirectory: MIGRATIONS_DIR })
        migrationsApi.mergeData(MIGRATIONS_TO_MERGE_ADDITIVE)

        expect(migrationsApi.getData()).toStrictEqual({
          [MIGRATION_100.filename]: MIGRATION_100,
          [MIGRATION_200.filename]: MIGRATION_200,
          [MIGRATION_300.filename]: MIGRATION_300,
          [MIGRATION_400.filename]: MIGRATION_400,
        })
      })

      it('sorts the stored data', () => {
        const migrationsApi = migrations({ localDirectory: MIGRATIONS_DIR })
        migrationsApi.mergeData(MIGRATIONS_TO_MERGE_UNORDERED)

        expect(migrationsApi.getData()).toStrictEqual({
          [MIGRATION_100.filename]: MIGRATION_100,
          [MIGRATION_200.filename]: MIGRATION_200,
          [MIGRATION_300.filename]: MIGRATION_300,
          [MIGRATION_400.filename]: MIGRATION_400,
        })
      })

      it('merges in a registered migration', () => {
        const migrationsApi = migrations({ localDirectory: MIGRATIONS_DIR })
        migrationsApi.mergeData([MIGRATION_100_REGISTERED])

        expect(migrationsApi.getData()).toStrictEqual({
          [MIGRATION_100.filename]: {
            ...MIGRATION_100,
            registered: MIGRATION_100_REGISTERED.registered,
            appliedAt: MIGRATION_100_REGISTERED.appliedAt,
            appliedAtFormatted: MIGRATION_100_REGISTERED.appliedAtFormatted,
          },
          [MIGRATION_200.filename]: MIGRATION_200,
        })
      })

      it('merges in a requested migration', () => {
        const migrationsApi = migrations({ localDirectory: MIGRATIONS_DIR })
        migrationsApi.mergeData([MIGRATION_200_REQUESTED])

        expect(migrationsApi.getData()).toStrictEqual({
          [MIGRATION_100.filename]: MIGRATION_100,
          [MIGRATION_200.filename]: {
            ...MIGRATION_200,
            requested: MIGRATION_200_REQUESTED.requested,
          },
        })
      })

      it('discards migration if merge result is undefined', () => {
        const migrationsApi = migrations({ localDirectory: MIGRATIONS_DIR })
        const mergeMigrationsSpy = jest
          .spyOn(migrationsApi, 'mergeMigrations')
          .mockReturnValueOnce(undefined)
        migrationsApi.mergeData([MIGRATION_100_REGISTERED])

        expect(migrationsApi.getData()).toStrictEqual({
          [MIGRATION_200.filename]: MIGRATION_200,
        })

        mergeMigrationsSpy.mockRestore()
      })
    })
  })
})
