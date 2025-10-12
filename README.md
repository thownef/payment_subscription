# Snap HTML API

A RESTful API service built with Express.js and TypeScript for handling HTML snapshots and templates.

## Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Validation**: Zod
- **Authentication**: Passport JWT
- **Security**: Helmet
- **Rate Limiting**: express-rate-limit

## Project Structure

```bash
src/
├── config/         # Configuration files (passport, database)
├── controllers/    # Request handlers (HTTP concerns)
├── middleware/     # Express middlewares (auth, validation, error)
├── routes/         # API route definitions
├── services/       # Business logic (domain logic)
├── utils/         # Utility functions (helpers, error handling)
├── validations/   # Request validation schemas (Zod)
├── enums/         # TypeScript enums
├── app.ts         # Express app setup
└── index.ts       # Application entry point
```

## Architecture Principles

### Layer Responsibilities

| Layer | Purpose | What it does |
|-------|---------|--------------|
| **Routes** | Define API endpoints | Route definitions, middleware chain |
| **Controllers** | Handle HTTP requests/responses | Extract data, call services, format responses |
| **Services** | Business logic | Database operations, business rules, throw errors |
| **Middleware** | Cross-cutting concerns | Authentication, validation, error handling |
| **Utils** | Helper functions | Common utilities, error classes |

### Error Handling

- **`ApiError`**: Custom error class for business logic errors
- **Error Middleware**: Centralized error handling for all error types
- **Response Format**: Consistent JSON response structure
- **Global Handlers**: Unhandled rejections and exceptions

### Authentication

- **Middleware**: JWT verification only
- **Controllers**: Handle auth endpoints (login, register, etc.)
- **Services**: Business logic for authentication
- **Routes**: Consistent pattern with validation and catchAsync

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Start development server
npm run dev
```

## Development Rules

1. **Controllers**: Use `catchAsync` wrapper, call services, return responses
2. **Services**: Implement business logic, throw `ApiError` for errors
3. **Middleware**: Handle authentication/validation only
4. **Routes**: Use consistent pattern: `validate → controller`
5. **Errors**: Let them bubble up to error middleware