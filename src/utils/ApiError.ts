interface ValidationError {
  readonly field: string
  readonly message: string
}

/**
 * Custom API Error class for handling operational and programming errors
 * @extends Error
 */
class ApiError extends Error {
  readonly statusCode: number
  readonly isOperational: boolean
  readonly errors: ValidationError[]

  /**
   * Creates an instance of ApiError
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param errors - Array of validation errors
   * @param isOperational - Whether this is an operational error (true) or programming error (false)
   * @param stack - Optional stack trace
   */
  constructor(statusCode: number, message?: string, errors: ValidationError[] = [], isOperational = true, stack = '') {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.errors = errors
    this.name = this.constructor.name

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default ApiError
