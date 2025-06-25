import axios from 'axios';

/**
 * Example of how to use the favorite music API
 */
async function favoriteMusic(token: string, userId: string, musicId: string) {
    try {
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
        console.log('Added to favorites:', addResponse.data);
        
        // Get user's favorite music
        const favoritesResponse = await axios.get(
            `http://localhost:3000/v1/user/${userId}/favorites`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        console.log('User favorites:', favoritesResponse.data);
        
        // Check if a specific music is in favorites
        const checkResponse = await axios.get(
            `http://localhost:3000/v1/user/${userId}/favorites/${musicId}/check`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        console.log('Is favorite:', checkResponse.data);
        
        // Get music with favorite status
        const musicResponse = await axios.get(
            `http://localhost:3000/v1/music/${musicId}?userId=${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        console.log('Music with favorite status:', musicResponse.data);
        
        // Get all music with favorite status
        const allMusicResponse = await axios.get(
            `http://localhost:3000/v1/music?userId=${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        console.log('All music with favorite status:', allMusicResponse.data);
        
        // Remove music from favorites
        const removeResponse = await axios.delete(
            `http://localhost:3000/v1/user/${userId}/favorites/${musicId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        console.log('Removed from favorites:', removeResponse.data);
        
        return {
            added: addResponse.data,
            favorites: favoritesResponse.data,
            isInFavorites: checkResponse.data,
            musicWithStatus: musicResponse.data,
            allMusicWithStatus: allMusicResponse.data,
            removed: removeResponse.data
        };
    } catch (error) {
        console.error('Error managing favorites:', error);
        throw error;
    }
}

export { favoriteMusic };