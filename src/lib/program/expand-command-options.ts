import { oneLine } from 'common-tags'
import type * as Program from './index.d'

type Name = keyof Program.IOptionInstances
type Entry = [Name, Program.IOptionParameters]

const expandCommandOption = (tuple: Program.OptionTuple): Entry => {
  const shortOption = '-'.concat(tuple[2])

  const longOption = '--'.concat(
    tuple[1].replace(/([A-Z])/g, '-$1').toLowerCase()
  )

  let allOptions = `${shortOption}, ${longOption}`
  switch (tuple[0]) {
    case 'value':
      allOptions = allOptions.concat(` [${tuple[1]}]`)
      break
    case 'variadic':
      allOptions = allOptions.concat(` [${tuple[1]}...]`)
      break
  }

  const english = 'Contentful '.concat(
    tuple[1]
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(' id', ' ID')
  )

  const envVar = 'CONTENTFUL_MIGRATION_'.concat(
    tuple[1].replace(/([A-Z])/g, '_$1').toUpperCase()
  )

  const fallback = tuple[3]

  const helpDefaults =
    typeof fallback === 'string'
      ? `, defaults to "${fallback}" if not defined anywhere`
      : ''

  const help = oneLine`
    the target ${english} - over-rides the environment variable
    ${envVar}${helpDefaults}
  `

  return [
    tuple[1],
    {
      shortOption,
      longOption,
      allOptions,
      english,
      envVar,
      fallback,
      help,
    },
  ]
}

const expandCommandOptions = (
  programOptionTuples: Program.OptionTuples
): Program.IOptions =>
  Object.fromEntries<Program.IOptionParameters>(
    programOptionTuples.map<Entry>(expandCommandOption)
  ) as Record<Name, Program.IOptionParameters>

export default expandCommandOptions
