type WithMessage = {
  message: string
}

const isWithMessage = (
  maybeWithMessage: unknown
): maybeWithMessage is WithMessage =>
  typeof maybeWithMessage === 'object' &&
  maybeWithMessage !== null &&
  'message' in maybeWithMessage &&
  typeof (maybeWithMessage as Record<string, unknown>).message === 'string'

const toErrorWithMessage = (maybeWithMessage: unknown): WithMessage => {
  if (maybeWithMessage instanceof Error) {
    // For some reason the entire object is now returned in the message by
    // Contentful SDK
    try {
      maybeWithMessage = JSON.parse(maybeWithMessage.message)
    } catch(e) {
      // Do nothing
    }
  }

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

const getErrorMessage = (maybeWithMessage: unknown) =>
  toErrorWithMessage(maybeWithMessage).message

export default getErrorMessage
