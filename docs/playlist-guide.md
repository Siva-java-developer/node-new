# Playlist Management API Guide

This guide covers the comprehensive playlist functionality that allows users to create, manage, and share playlists with other users.

## Features

### Core Playlist Features
- ✅ Create, read, update, and delete playlists
- ✅ Add and remove songs from playlists
- ✅ Reorder songs within playlists
- ✅ Track total duration and play counts
- ✅ Support for playlist thumbnails

### Sharing Features
- ✅ Share playlists between users
- ✅ Control edit permissions for shared users
- ✅ Public/private/shared visibility settings
- ✅ Collaborative editing capabilities
- ✅ Unshare functionality

### Discovery Features
- ✅ Browse public playlists
- ✅ Search playlists by name, owner, or visibility
- ✅ View playlists shared with you
- ✅ Play count tracking for popularity

## API Endpoints

### Authentication Required Routes

#### Create Playlist
```http
POST /v1/playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Playlist",
  "description": "Optional description",
  "visibility": "private", // "private", "public", or "shared"
  "thumbnail": "optional-thumbnail-url"
}
```

#### Get User's Playlists
```http
GET /v1/playlists/my?page=1&limit=10
Authorization: Bearer <token>
```

#### Get All Accessible Playlists
```http
GET /v1/playlists/accessible?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Shared Playlists
```http
GET /v1/playlists/shared?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Playlist by ID
```http
GET /v1/playlists/:id
Authorization: Bearer <token>
```

#### Update Playlist
```http
PUT /v1/playlists/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "visibility": "public"
}
```

#### Delete Playlist
```http
DELETE /v1/playlists/:id
Authorization: Bearer <token>
```

#### Add Song to Playlist
```http
POST /v1/playlists/:id/songs
Authorization: Bearer <token>
Content-Type: application/json

{
  "songId": "song-id-here"
}
```

#### Remove Song from Playlist
```http
DELETE /v1/playlists/:id/songs
Authorization: Bearer <token>
Content-Type: application/json

{
  "songId": "song-id-here"
}
```

#### Reorder Songs
```http
PUT /v1/playlists/:id/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "songIds": ["song1", "song2", "song3"]
}
```

#### Share Playlist
```http
POST /v1/playlists/:id/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["user1", "user2"],
  "canEdit": true
}
```

#### Unshare Playlist
```http
POST /v1/playlists/:id/unshare
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["user1", "user2"]
}
```

#### Play Playlist
```http
POST /v1/playlists/:id/play
Authorization: Bearer <token>
```

### Public Routes (No Authentication Required)

#### Get Public Playlists
```http
GET /v1/playlists/public?page=1&limit=10
```

#### Search Playlists
```http
GET /v1/playlists/search?name=query&visibility=public&page=1&limit=10
```

## Playlist Visibility Types

### Private
- Only the owner can see and edit the playlist
- Not visible to other users unless explicitly shared

### Public
- Visible to all users
- Anyone can view the playlist
- Only owner and collaborators can edit

### Shared
- Visible to users in the `sharedWith` array
- Owner controls who can access and edit

## Permission System

### Owner Permissions
- Full control over the playlist
- Can share/unshare with other users
- Can add/remove collaborators
- Can delete the playlist
- Can change visibility settings

### Collaborator Permissions
- Can add/remove songs
- Can reorder songs
- Cannot delete the playlist
- Cannot change sharing settings
- Cannot change visibility

### Shared User Permissions (Non-Collaborator)
- Can view the playlist
- Can play the playlist
- Cannot edit the playlist

### Public Access
- Can view public playlists
- Can play public playlists
- Cannot edit unless they are collaborators

## Data Models

### Playlist Schema
```typescript
{
  _id: ObjectId,
  name: string,
  description?: string,
  owner: ObjectId, // Reference to User
  visibility: 'private' | 'public' | 'shared',
  songs: ObjectId[], // Array of Music references
  sharedWith: ObjectId[], // Array of User references
  collaborators: ObjectId[], // Array of User references
  totalDuration: number, // In seconds
  playCount: number,
  thumbnail?: string,
  uid: string, // Unique identifier
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Examples

### Creating and Sharing a Playlist

1. **Create a playlist**
```javascript
const response = await fetch('/v1/playlists', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Educational Songs",
    description: "Songs for mathematics learning",
    visibility: "private"
  })
});
```

2. **Add songs to the playlist**
```javascript
await fetch(`/v1/playlists/${playlistId}/songs`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    songId: "song-id-1"
  })
});
```

3. **Share with other users**
```javascript
await fetch(`/v1/playlists/${playlistId}/share`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userIds: ["teacher-user-id", "student-user-id"],
    canEdit: false // Teachers can edit, students can only view
  })
});
```

### Collaborative Playlist Management

1. **Share with edit permissions**
```javascript
await fetch(`/v1/playlists/${playlistId}/share`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userIds: ["collaborator-user-id"],
    canEdit: true
  })
});
```

2. **Collaborator adds songs**
```javascript
// The collaborator can now add songs
await fetch(`/v1/playlists/${playlistId}/songs`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + collaboratorToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    songId: "new-song-id"
  })
});
```

## Best Practices

1. **Playlist Organization**
   - Use descriptive names for playlists
   - Add meaningful descriptions
   - Set appropriate visibility levels

2. **Sharing Management**
   - Only share with trusted users when giving edit permissions
   - Regularly review shared playlists
   - Use public visibility for playlists meant for broad consumption

3. **Performance Considerations**
   - Use pagination when fetching playlists
   - Limit the number of songs per playlist for better performance
   - Consider using playlist summaries for list views

4. **Security**
   - Always validate user permissions before allowing playlist modifications
   - Use proper authentication for all protected routes
   - Sanitize user input for playlist names and descriptions

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `404 Not Found` - Playlist doesn't exist
- `403 Forbidden` - User doesn't have permission
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `500 Internal Server Error` - Server error

Example error response:
```json
{
  "success": false,
  "message": "You do not have permission to edit this playlist!",
  "error": "PLAYLIST_EDIT_DENIED"
}
```

## Integration with Frontend

The playlist API is designed to work seamlessly with modern frontend frameworks. Use the provided examples and adapt them to your frontend framework of choice (React, Vue, Angular, etc.).

Key considerations for frontend integration:
- Implement proper error handling and user feedback
- Use loading states during API calls
- Implement real-time updates for collaborative features
- Cache playlist data appropriately
- Implement drag-and-drop for song reordering