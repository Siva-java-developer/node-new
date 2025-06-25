# Favorite Music Feature Guide

This guide explains how to use the favorite music feature in the application.

## Overview

The favorite music feature allows users to:
- Add music to their favorites
- Remove music from their favorites
- View their favorite music
- Check if a specific music is in their favorites
- Get music with favorite status information

## API Endpoints

### User Favorites

#### Get User's Favorite Music
```
GET /v1/user/:userId/favorites
```
Returns a list of all music that the user has added to favorites.

#### Add Music to Favorites
```
POST /v1/user/:userId/favorites
```
Request body:
```json
{
  "musicId": "60d21b4667d0d8992e610c85"
}
```

#### Remove Music from Favorites
```
DELETE /v1/user/:userId/favorites/:musicId
```

#### Check if Music is in Favorites
```
GET /v1/user/:userId/favorites/:musicId/check
```
Returns:
```json
{
  "success": true,
  "isFavorite": true
}
```

### Music with Favorite Status

#### Get Music by ID with Favorite Status
```
GET /v1/music/:id?userId=:userId
```
Returns the music with an additional `isFavorite` field indicating whether the music is in the user's favorites.

#### Get All Music with Favorite Status
```
GET /v1/music?userId=:userId
```
Returns all music with an additional `isFavorite` field for each music item.

## Example Usage

See the `examples/favorite-music-example.ts` file for a complete example of how to use the favorite music API.

```typescript
// Add music to favorites
const addResponse = await axios.post(
    `http://localhost:3000/v1/user/${userId}/favorites`,
    { musicId },
    {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }
);

// Get user's favorite music
const favoritesResponse = await axios.get(
    `http://localhost:3000/v1/user/${userId}/favorites`,
    {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
);

// Get music with favorite status
const musicResponse = await axios.get(
    `http://localhost:3000/v1/music/${musicId}?userId=${userId}`,
    {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
);
```

## Implementation Details

The favorite music feature is implemented by:
1. Storing an array of music IDs in the user document
2. Using MongoDB's `$addToSet` and `$pull` operators to add and remove favorites
3. Populating the favorites array when retrieving user's favorite music
4. Checking if a music ID is in the user's favorites array to determine favorite status

## Security Considerations

- All favorite music endpoints require authentication
- Users can only manage their own favorites (enforced by the API)
- Admin users can manage any user's favorites