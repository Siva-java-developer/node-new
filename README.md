# User Management API

A RESTful API for managing user data built with Express, TypeScript, and MongoDB.

## Features

- Create, read, update, and delete users
- Swagger API documentation
- MongoDB database integration
- TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=mongodb://localhost:27017/user-management
   PORT=8111
   ```

### Running the Application

```
npm run dev
```

The server will start on port 8111 (or the port specified in your .env file).

## API Documentation

Swagger documentation is available at:

```
http://localhost:8111/api-docs
```

## API Endpoints

| Method | Endpoint     | Description      |
|--------|--------------|------------------|
| POST   | /v1/user     | Create a new user |
| GET    | /v1/user     | Get all users    |
| GET    | /v1/user/:id | Get user by ID   |
| PUT    | /v1/user/:id | Update user      |
| DELETE | /v1/user/:id | Delete user      |

## User Model

```typescript
{
  firstName: string;
  lastName: string;
  username: string;
  age: number;
  gender: string; // 'male', 'female', or 'other'
  mobileNumber: string;
  role: string; // 'student' or 'teacher'
  class: string;
  uid: string; // auto-generated
}
```