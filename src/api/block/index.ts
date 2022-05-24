import chalk from '../../lib/program/chalk'
import data from '../data'
import { isUnsafeData } from '../data/guards'
import inquirer from 'inquirer'
import type * as Block from './types'
import type * as Data from '../data/types'

const VALID_BLOCK_LABELS: Array<Block.Label> = ['warning', 'error', 'abort', 'success']

const block = (heading?: string, indent: number = 1): Block.IAPI => {
  const store: Block.IStore = {
		content: [],
    actions: {},
    indent,
  }

  const api: Block.IAPI = {
		heading: (text, { label, trim = true, indent } = {}) => {
      store.content.push({
        type: 'heading',
        label,
        text,
        trim,
        indent: indent ?? store.indent,
      })
      return api
    },
    
    text: (text, { label, trim = true, indent } = {}) => {
      store.content.push({
        type: 'text',
        label,
        text,
        trim,
        indent: indent ?? store.indent,
      })
      return api
    },
    
    blank: (indent) => api.text('', { indent }),

    data: (type, unsafeData, { indent, alignments } =  {}) => {
      let headers: Data.UnsafeData
      let rows: Data.UnsafeData
      let footers: Data.UnsafeData
      if (isUnsafeData(unsafeData)) {
        rows = unsafeData
      } else {
        headers = unsafeData.headers
        rows = unsafeData.rows
        footers = unsafeData.footers
      }

      const defaultCell = type === 'table' ? '-' : undefined

      data(rows, defaultCell)
        .setHeader(headers)
        .setFooter(footers)
        .setAlignments(alignments)
        [type]()
        .forEach((line) => {
          store.content.push({
            type: 'text',
            text: line,
            trim: false,
            indent: indent ?? store.indent,
          })
        })

      return api
    },

    definitions: (data, options) => api.data('definitions', data, options),

    list: (data, options) => api.data('list', data, options),

    table: (data, options) => api.data('table', data, options),

    wait: (id, prefix, { indent } = {}) => {
      api.print()

      const safePrefix = typeof prefix === 'string' ? prefix : 'Waiting'
      const safeIndent = '  | '.repeat(indent ?? store.indent)
      process.stdout.write(`${safeIndent}${safePrefix} `)

      const timer = setInterval(() => {
        if ((store.actions[id].seconds + 1) % 4 === 0) {
          process.stdout.moveCursor(0, 0)
          process.stdout.clearLine(0)
          process.stdout.cursorTo(0)
          process.stdout.write(`${safeIndent}${safePrefix} `)
        } else {
          process.stdout.write('.')
        }
        store.actions[id].seconds++
      }, 1000)

      store.actions[id] = {
        id,
        timer,
        seconds: 0
      }

      return api
    },

    resume: (id, notice, { indent } = {}) => {
      clearTimeout(store.actions[id].timer)
      process.stdout.moveCursor(0, 0)
      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      const safeNotice = typeof notice === 'string' && notice !== ''
        ? notice
            .trim()
            .replace(/\{seconds\}/g, String(store.actions[id].seconds))
        : `Waited for ${store.actions[id].seconds}s`
      const safeIndent = '  │ '.repeat(indent ?? store.indent)
      process.stdout.write(`${safeIndent}${safeNotice}\n`)
      return api
    },

    setIndent: (level = 0) => {
      store.indent = Math.max(0, level)
      return api
    },

    _label: (label) => {
      switch (label) {
        case 'warning':
          return chalk.warning(' Warning ')

        case 'error':
          return chalk.error(' Error ')

        case 'abort':
          return chalk.success(' Aborting ')

        case 'success':
          return chalk.success(' Success ')
      }

      return ''
    },

    confirm: async (message: string, { indent } = {}) => {
      const safeIndent = '  │ '.repeat(indent ?? store.indent)

      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          prefix: `${safeIndent}?`,
          message,
        }
      ])

      return !!answer.confirmed
    },

    abort: ({ indent } = {}) => api
      .blank()
      .text('', { label: 'abort', indent })
      .finish(),

    complete: ({ indent } = {}) => api
      .blank()
      .text('', { label: 'success', indent })
      .finish(),

    print: () => {
      store.content.forEach((line) => {
        const trim = line.trim === false ? false : true
        const safeIndent = '  │ '.repeat(line.indent)

        let safeLine = trim ? line.text.trim() : line.text
        safeLine = line.type === 'heading'
          ? chalk.heading(safeLine)
          : safeLine

        let safeLabel = api._label(line.label)
        safeLabel = safeLabel === ''
          ? ''
          : safeLabel.concat(safeLine === '' ? '' : ' - ')

        console.info(`${safeIndent}${safeLabel}${safeLine}`)
      })
      store.content = []
      return api
    },

    finish: () => {
      api.blank(0)
      api.print()
      return
    }
  }

  return typeof heading === 'string'
    ? api.heading(heading, { indent: 0 })
    : api
}

export default block
