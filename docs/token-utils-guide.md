# Token Utilities Guide

This guide explains how to extract user information from a login token for internal API use.

## Overview

The token utilities provide several ways to extract user information from a JWT token:

1. Direct use of `TokenUtils` class
2. Using the `AuthService` class
3. Using the API endpoint

## 1. Direct Use of TokenUtils

The `TokenUtils` class provides static methods to extract information from a token:

```typescript
import { TokenUtils } from '../utils/token.utils';

// Extract user ID from token
const userId = TokenUtils.getUserIdFromToken(token);

// Extract user role from token
const userRole = TokenUtils.getUserRoleFromToken(token);

// Get full user object from token (async)
const user = await TokenUtils.getUserFromToken(token);
```

## 2. Using AuthService

The `AuthService` class provides methods to extract user information from a token:

```typescript
import AuthService from '../service/auth.service';
import Container from 'typedi';

// Get auth service from container
const authService = Container.get(AuthService);

// Get user from token (async)
const user = await authService.getLoggedInUser(token);

// Get user ID from token
const userId = authService.getLoggedInUserId(token);

// Check if user has specific role
const isAdmin = authService.hasRole(token, ['admin']);
```

## 3. Using the API Endpoint

You can also use the API endpoint to get user information from a token:

```typescript
import axios from 'axios';

// Call the API endpoint
const response = await axios.post('/v1/auth/profile/token', {
    token
});

const user = response.data.data;
```

## Extracting Token from Request Headers

To extract a token from request headers:

```typescript
import { TokenUtils } from '../utils/token.utils';

// Extract token from Authorization header
const token = TokenUtils.extractTokenFromHeader(req.headers.authorization);

if (!token) {
    // Handle missing token
}
```

## Error Handling

All methods will throw a `CustomError` if the token is invalid or expired. Make sure to handle these errors appropriately:

```typescript
try {
    const user = await authService.getLoggedInUser(token);
    // Use user data
} catch (error) {
    // Handle invalid token error
    console.error('Error:', error.message);
}
```

## Complete Example

See the `examples/token-usage-example.ts` file for complete examples of how to use these utilities.