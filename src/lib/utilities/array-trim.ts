import isFalsy from './is-falsy'

const arrayTrim = <T>(
  original: Array<T>,
  position?: 'start' | 'end'
): Array<T> => {
  let copy = [...original]

  const trimStart = typeof position === 'undefined' || position === 'start'
  const trimEnd = typeof position === 'undefined' || position === 'end'

  if (trimStart) {
    let complete = false
    copy = copy.reduce<Array<T>>((accumulator, current) => {
      if (complete) {
        accumulator.push(current)
        return accumulator
      }

      if (isFalsy(current)) {
        return accumulator
      }

      complete = true
      accumulator.push(current)
      return accumulator
    }, [])
  }

  if (trimEnd) {
    let complete = false
    copy = copy.reduceRight<Array<T>>((accumulator, current) => {
      if (complete) {
        accumulator.push(current)
        return accumulator
      }

      if (isFalsy(current)) {
        return accumulator
      }

      complete = true
      accumulator.push(current)
      return accumulator
    }, []).reverse()
  }

  return copy
}

export default arrayTrim
