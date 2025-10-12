import { Request, Response, NextFunction } from 'express'
import { errorHandler } from '@/middleware/error.middleware'
import ApiError from '@/utils/ApiError'

/**
 * Global error handler for unhandled promise rejections
 */
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error('Unhandled Promise Rejection:', {
      reason,
      promise,
      timestamp: new Date().toISOString()
    })
    
    // In production, you might want to restart the process or send alerts
    if (process.env.NODE_ENV === 'production') {
      // Log to external service before exiting
      console.error('Process will exit due to unhandled rejection')
      process.exit(1)
    }
  })
}

/**
 * Global error handler for uncaught exceptions
 */
export const handleUncaughtException = () => {
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })

    // In production, you might want to restart the process
    if (process.env.NODE_ENV === 'production') {
      // Log to external service before exiting
      console.error('Process will exit due to uncaught exception')
      process.exit(1)
    }
  })
}

/**
 * 404 handler for undefined routes
 */
export const handleNotFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`)
  errorHandler(error, req, res, next)
}

/**
 * Initialize all global error handlers
 */
export const initializeErrorHandlers = () => {
  handleUnhandledRejection()
  handleUncaughtException()
}
