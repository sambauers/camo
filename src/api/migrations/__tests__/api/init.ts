import { join } from 'node:path'
import migrations from '../../index.js'

const MIGRATIONS_DIR = join(__dirname, '../../__fixtures__/migrations')

describe('api', () => {
  describe('migrations', () => {
    it('initialises the api', () => {
      const migrationsApi = migrations({ localDirectory: MIGRATIONS_DIR })

      expect(migrationsApi.getLocalDirectory()).toBe(MIGRATIONS_DIR)
      expect(migrationsApi.getLocal({ list: 'id' })).toStrictEqual([100, 200])
    })
  })
})
