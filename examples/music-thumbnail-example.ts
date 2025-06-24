import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

/**
 * Example of how to upload a music thumbnail
 * @param thumbnailPath Path to the thumbnail image file
 * @returns Upload response with file path
 */
async function uploadMusicThumbnail(thumbnailPath: string) {
    try {
        // Create form data
        const formData = new FormData();
        formData.append('imageFile', fs.createReadStream(thumbnailPath));
        
        // Set headers with authentication token
        const headers = {
            ...formData.getHeaders(),
            'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE'
        };
        
        // Make API request
        const response = await axios.post(
            'http://localhost:3000/v1/music/upload/thumbnail',
            formData,
            { headers }
        );
        
        console.log('Thumbnail uploaded successfully:');
        console.log('File path:', response.data.filePath);
        console.log('Message:', response.data.message);
        
        return response.data;
    } catch (error: any) {
        console.error('Error uploading thumbnail:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Example of how to get music with thumbnail
 * @param musicId The ID of the music to get
 */
async function getMusicWithThumbnail(musicId: string) {
    try {
        // Set headers with authentication token
        const headers = {
            'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE'
        };
        
        // Make API request
        const response = await axios.get(
            `http://localhost:3000/v1/music/${musicId}`,
            { headers }
        );
        
        const music = response.data.data;
        
        console.log('Music details:');
        console.log('Title:', music.subject);
        console.log('Thumbnail:', music.thumbnail || 'No thumbnail');
        console.log('Audio file:', music.music);
        
        return music;
    } catch (error: any) {
        console.error('Error getting music:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Example of how to update a music entry with a thumbnail
 * @param musicId The ID of the music to update
 * @param thumbnailPath Path to the thumbnail image
 */
async function updateMusicWithThumbnail(musicId: string, thumbnailPath: string) {
    try {
        // First upload the thumbnail
        const uploadResult = await uploadMusicThumbnail(thumbnailPath);
        
        // Then update the music entry with the thumbnail path
        const headers = {
            'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE',
            'Content-Type': 'application/json'
        };
        
        // Update the music entry with the thumbnail path
        const updateResponse = await axios.put(
            `http://localhost:3000/v1/music/${musicId}`,
            { thumbnail: uploadResult.filePath },
            { headers }
        );
        
        console.log('Music updated with thumbnail successfully');
        return updateResponse.data;
    } catch (error) {
        console.error('Error updating music with thumbnail:', error);
        throw error;
    }
}

export {
    uploadMusicThumbnail,
    getMusicWithThumbnail,
    updateMusicWithThumbnail
};