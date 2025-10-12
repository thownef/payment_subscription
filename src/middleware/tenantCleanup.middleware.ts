import { closeAllTenantConnections } from '@/services/tenantDatabase.service'

/**
 * Graceful shutdown handler for tenant database connections
 * Should be called when the application is shutting down
 */
export const gracefulShutdown = async () => {
  console.log('Closing all tenant database connections...')
  try {
    await closeAllTenantConnections()
    console.log('All tenant database connections closed successfully')
  } catch (error) {
    console.error('Error closing tenant database connections:', error)
  }
}

/**
 * Setup graceful shutdown handlers
 */
export const setupGracefulShutdown = () => {
  // Handle SIGTERM (termination signal)
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...')
    await gracefulShutdown()
    process.exit(0)
  })

  // Handle SIGINT (interrupt signal)
  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...')
    await gracefulShutdown()
    process.exit(0)
  })

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error)
    await gracefulShutdown()
    process.exit(1)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    await gracefulShutdown()
    process.exit(1)
  })
}
