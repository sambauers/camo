type WithMessage = {
  message: string
}

const isWithMessage = (error: unknown): error is WithMessage =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof (error as Record<string, unknown>).message === 'string'

const toErrorWithMessage = (maybeWithMessage: unknown): WithMessage => {
  if (isWithMessage(maybeWithMessage)) {
    return maybeWithMessage
  }

  if (typeof maybeWithMessage === 'string') {
    return new Error(maybeWithMessage)
  }

  try {
    return new Error(JSON.stringify(maybeWithMessage))
  } catch {
    return new Error(String(maybeWithMessage))
  }
}

const getErrorMessage = (error: unknown) => toErrorWithMessage(error).message

export default getErrorMessage
