# Music Thumbnail Guide

This guide explains how to use the thumbnail functionality for music in the application.

## Overview

The music thumbnail feature allows you to:

1. Upload thumbnail images for music entries
2. Associate thumbnails with specific music entries
3. Retrieve music entries with their associated thumbnails

## Uploading Thumbnails

### Using the API

You can upload thumbnails using the `/v1/music/upload/thumbnail` endpoint:

```javascript
// Example using axios
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

async function uploadThumbnail(thumbnailPath) {
  const formData = new FormData();
  formData.append('imageFile', fs.createReadStream(thumbnailPath));
  
  const response = await axios.post(
    'http://localhost:3000/v1/music/upload/thumbnail',
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_AUTH_TOKEN'
      }
    }
  );
  
  // Response format:
  // {
  //   success: true,
  //   fileName: "thumbnail-1234567890.jpg",
  //   filePath: "/uploads/Music/thumbnails/thumbnail-1234567890.jpg",
  //   message: "Thumbnail uploaded successfully"
  // }
  
  return response.data;
}
```

### Using the Web Form

We've provided a simple HTML form for uploading thumbnails at `/public/thumbnail-upload.html`. To use it:

1. Open the form in your browser
2. Enter your authentication token
3. Enter the music ID
4. Select an image file
5. Click "Upload Thumbnail"

## Retrieving Music with Thumbnails

When you retrieve a music entry, the thumbnail will be included in the response:

```javascript
// Example using axios
import axios from 'axios';

async function getMusicWithThumbnail(musicId) {
  const response = await axios.get(
    `http://localhost:3000/v1/music/${musicId}`,
    {
      headers: {
        'Authorization': 'Bearer YOUR_AUTH_TOKEN'
      }
    }
  );
  
  const music = response.data.data;
  console.log('Thumbnail URL:', music.thumbnail);
  
  return music;
}
```

## Updating Music with Thumbnails

To associate a thumbnail with a music entry, first upload the thumbnail and then update the music entry with the thumbnail path:

```javascript
// Example using axios
import axios from 'axios';

async function updateMusicWithThumbnail(musicId, thumbnailPath) {
  // First upload the thumbnail
  const uploadResult = await uploadThumbnail(thumbnailPath);
  
  // Then update the music entry with the thumbnail path
  const updateResponse = await axios.put(
    `http://localhost:3000/v1/music/${musicId}`,
    { thumbnail: uploadResult.filePath },
    {
      headers: {
        'Authorization': 'Bearer YOUR_AUTH_TOKEN',
        'Content-Type': 'application/json'
      }
    }
  );
  
  return updateResponse.data;
}

## Technical Details

- Thumbnails are stored in the `/uploads/Music/thumbnails` directory
- Images are automatically resized to 300x300 pixels
- Supported formats: JPEG, PNG, GIF, WEBP
- Maximum file size: 20MB (configurable in `config/upload.config.ts`)

## Example Code

For complete examples, see:

- `examples/music-thumbnail-example.ts` - TypeScript examples for uploading and retrieving thumbnails
- `public/thumbnail-upload.html` - HTML form example for uploading thumbnails