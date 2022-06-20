import { join } from 'node:path'
import migrations from '../../index.js'

const MIGRATIONS_DIR = join(__dirname, '../../__fixtures__/migrations')
const MIGRATIONS_ALT_DIR = join(__dirname, '../../__fixtures__/migrations-alt')

describe('api', () => {
  describe('migrations', () => {
    describe('getLocalDirectory()', () => {
      it('gets the local directory', () => {
        const migrationsApi = migrations({ localDirectory: MIGRATIONS_DIR })

        expect(migrationsApi.getLocalDirectory()).toBe(MIGRATIONS_DIR)

        migrationsApi.setLocalDirectory(MIGRATIONS_ALT_DIR)

        expect(migrationsApi.getLocalDirectory()).toBe(MIGRATIONS_ALT_DIR)
      })
    })
  })
})
