import { join } from 'node:path'
import migrations from '../../index.js'

const MIGRATIONS_DIR = join(__dirname, '../../__fixtures__/migrations')
const MIGRATIONS_ALT_DIR = join(__dirname, '../../__fixtures__/migrations-alt')
const NULL_DIR = join(__dirname, '../../__fixtures__/migrations-null')
const FILE_DIR = join(__dirname, '../../__fixtures__/migrations-file')
const UNREADABLE_DIR = join(
  __dirname,
  '../../__fixtures__/migrations-unreadable'
)

describe('api', () => {
  describe('migrations', () => {
    describe('setLocalDirectory()', () => {
      const migrationsApi = migrations({ localDirectory: MIGRATIONS_DIR })

      it('resets the local directory', () => {
        migrationsApi.setLocalDirectory(MIGRATIONS_ALT_DIR)

        expect(migrationsApi.getLocalDirectory()).toBe(MIGRATIONS_ALT_DIR)
        expect(migrationsApi.getLocal({ list: 'id' })).toStrictEqual([300, 400])
      })

      it('throws if the local directory is an empty string', () => {
        const setBadly = () => {
          migrationsApi.setLocalDirectory('')
        }

        expect(setBadly).toThrowError('is empty')
      })

      it('throws if the local directory does not exist', () => {
        const setBadly = () => {
          migrationsApi.setLocalDirectory(NULL_DIR)
        }

        expect(setBadly).toThrowError('is not a directory')
      })

      it('throws if the local directory is a file', () => {
        const setBadly = () => {
          migrationsApi.setLocalDirectory(FILE_DIR)
        }

        expect(setBadly).toThrowError('is not a directory')
      })

      it('throws if the local directory is unreadable', () => {
        const setBadly = () => {
          migrationsApi.setLocalDirectory(UNREADABLE_DIR)
        }

        expect(setBadly).toThrowError('could not be read')
      })
    })
  })
})
