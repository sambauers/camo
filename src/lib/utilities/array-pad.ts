const arrayPad = <T>(
  original: Array<T>,
  position: 'start' | 'end',
  length: number,
  fill: T
): Array<T> => {
  const copy = [...original]
  copy.splice(
    position === 'start' ? 0 : original.length,
    0,
    ...new Array(length - original.length).fill(fill)
  )
  return copy
}

export default arrayPad
