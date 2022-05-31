import chalk from './chalk'

interface IExitOptions {
  title?: string
  message?: string
}

const exit = (options?: IExitOptions): void => {
  const { title, message } = options ?? {}
  console.info('')
  const hasTitle = typeof title === 'string' && title !== ''
  console.error(`${chalk.error(' Error ')}${hasTitle ? ' - ' : ''}${title}`)
  if (typeof message === 'string' && message !== '') {
    console.info(message)
  }
  console.info('')
}

export default exit
