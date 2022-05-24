import chalk from './chalk'

interface IExitOptions {
  title?: string
  message?: string
}

const exit = ({ title,  message }: IExitOptions): void => {
  console.info('')
  const hasTitle = typeof title === 'string' && title !== ''
  console.error(`${chalk.error(' Error ')}${hasTitle ? ' - ' : ''}${title}`)
  message && console.info(message)
  console.info('')
}

export default exit
