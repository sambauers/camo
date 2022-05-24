import chalk from 'chalk'

export default {
  heading: chalk.underline,
  dim: chalk.dim,
  error: chalk.rgb(255, 255, 255).bgRedBright,
  warning: chalk.rgb(255, 255, 255).bgRgb(255, 100, 0),
  success: chalk.rgb(255, 255, 255).bgGreen,
  emphasise: chalk.underline, 
}
