const isFalsy = (value: unknown): boolean =>
  typeof value === 'undefined' ||
  (typeof value === 'boolean' && value === false) ||
  (typeof value === 'string' && value === '') ||
  (typeof value === 'object' && value === null)

export default isFalsy
