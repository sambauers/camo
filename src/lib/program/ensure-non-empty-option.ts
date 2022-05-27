import { oneLine } from 'common-tags'

import type * as Program from './types'
import exit from './exit'

type OmittedOptions = 'migrations' | 'list' | 'dry'

const ensureNonEmptyOption = (
  options: Program.IOptionInstances,
  programOptions: Program.IOptions,
  name: keyof Omit<Program.IOptions, OmittedOptions>,
  code: number
): void => {
  const fallbacks = [
    options[name],
    process.env[programOptions[name].envVar],
    programOptions[name].fallback,
  ]

  const safeOption = fallbacks.find(
    (fallback) => typeof fallback === 'string' && fallback !== ''
  )

  if (typeof safeOption === 'string') {
    options[name] = safeOption
    return
  }

  exit({
    title: `No ${programOptions[name].english} specified`,
    message: oneLine`
      Specify using the ${programOptions[name].longOption} command line
      option or the environment variable ${programOptions[name].envVar}
    `,
  })
  process.exit(code)
}

export default ensureNonEmptyOption
