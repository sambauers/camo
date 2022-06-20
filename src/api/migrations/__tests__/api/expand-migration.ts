import { join } from 'node:path'
import migrations from '../../index.js'

const MIGRATIONS_DIR = join(__dirname, '../../__fixtures__/migrations')

describe('api', () => {
  describe('migrations', () => {
    describe('expandMigration()', () => {
      it('expands migrations', () => {
        const migrationsApi = migrations({ localDirectory: MIGRATIONS_DIR })

        expect(
          migrationsApi.expandMigration({ filename: '100-description.ts' })
        ).toStrictEqual({
          filename: '100-description.ts',
          basename: '100-description',
          id: 100,
          local: false,
          registered: false,
          requested: false,
        })

        expect(
          migrationsApi.expandMigration({
            filename: '100-description.ts',
            requested: true,
          })
        ).toStrictEqual({
          filename: '100-description.ts',
          basename: '100-description',
          id: 100,
          local: false,
          registered: false,
          requested: true,
        })

        expect(
          migrationsApi.expandMigration({
            filename: '100-description.ts',
            local: true,
          })
        ).toStrictEqual({
          filename: '100-description.ts',
          basename: '100-description',
          id: 100,
          local: true,
          path: join(MIGRATIONS_DIR, '100-description.ts'),
          registered: false,
          requested: false,
        })

        expect(
          migrationsApi.expandMigration({
            filename: '100-description.ts',
            registered: true,
            appliedAt: '2022-05-25T11:18:46+1000',
            appliedAtFormatted: 'Wed, 25 May 2022, 11:18:46 AEST',
          })
        ).toStrictEqual({
          filename: '100-description.ts',
          basename: '100-description',
          id: 100,
          local: false,
          registered: true,
          requested: false,
          appliedAt: '2022-05-25T11:18:46+1000',
          appliedAtFormatted: 'Wed, 25 May 2022, 11:18:46 AEST',
        })
      })
    })
  })
})
