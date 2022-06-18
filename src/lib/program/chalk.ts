const wrap = (code: string) => `\u001B[${code}m`

const style = (
  input: string,
  ...styles: Array<[number | string, number | string]>
) => {
  let output = input
  styles.forEach(([start, end]) => {
    output = `${wrap(String(start))}${output}${wrap(String(end))}`
  })
  return `${wrap('0')}${output}${wrap('0')}`
}

const underline = (input: string) => style(input, [4, 24])

export default {
  heading: underline,
  dim: (input: string) => style(input, [2, 22]),
  error: (input: string) => style(input, ['38;5;231', 39], [101, 49]),
  warning: (input: string) => style(input, ['38;5;231', 39], ['48;5;208', 49]),
  success: (input: string) => style(input, ['38;5;231', 39], [42, 49]),
  emphasise: underline,
}
