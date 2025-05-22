# Payment Subscription API

A RESTful API service built with Express.js and TypeScript for handling payment subscriptions.

## Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Validation**: Zod
- **Authentication**: Passport JWT
- **Security**: Helmet

## Features

- User authentication (Register/Login)
- Input validation using Zod
- Error handling middleware
- TypeScript support
- Database integration with Prisma
- Security headers with Helmet
- CORS support

## Project Structure
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Express middlewares
├── routes/         # API routes
├── services/       # Business logic
├── utils/         # Utility functions
├── validations/   # Request validation schemas
├── app.ts         # Express app setup
└── index.ts       # Application entry point