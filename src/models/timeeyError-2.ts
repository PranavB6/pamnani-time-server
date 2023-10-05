import type ErrorType from './errorType'
import StatusCode from './statusCode'

class TimeeyError extends Error {
  type: string
  message: string
  code: StatusCode
  data: unknown

  constructor(args: {
    type: ErrorType
    message: string
    code?: StatusCode
    data?: unknown
  }) {
    super(args.message)
    this.type = args.type
    this.message = args.message
    this.code = args.code ?? StatusCode.INTERNAL_SERVER_ERROR
    this.data = args.data
  }

  toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      data: this.data,
    }
  }
}

export default TimeeyError
