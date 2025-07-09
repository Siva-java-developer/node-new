"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteMusic = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Example of how to use the favorite music API
 */
function favoriteMusic(token, userId, musicId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Add music to favorites
            const addResponse = yield axios_1.default.post(`http://localhost:3000/v1/user/${userId}/favorites`, { musicId }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Added to favorites:', addResponse.data);
            // Get user's favorite music
            const favoritesResponse = yield axios_1.default.get(`http://localhost:3000/v1/user/${userId}/favorites`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('User favorites:', favoritesResponse.data);
            // Check if a specific music is in favorites
            const checkResponse = yield axios_1.default.get(`http://localhost:3000/v1/user/${userId}/favorites/${musicId}/check`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Is favorite:', checkResponse.data);
            // Get music with favorite status
            const musicResponse = yield axios_1.default.get(`http://localhost:3000/v1/music/${musicId}?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Music with favorite status:', musicResponse.data);
            // Get all music with favorite status
            const allMusicResponse = yield axios_1.default.get(`http://localhost:3000/v1/music?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('All music with favorite status:', allMusicResponse.data);
            // Remove music from favorites
            const removeResponse = yield axios_1.default.delete(`http://localhost:3000/v1/user/${userId}/favorites/${musicId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Removed from favorites:', removeResponse.data);
            return {
                added: addResponse.data,
                favorites: favoritesResponse.data,
                isInFavorites: checkResponse.data,
                musicWithStatus: musicResponse.data,
                allMusicWithStatus: allMusicResponse.data,
                removed: removeResponse.data
            };
        }
        catch (error) {
            console.error('Error managing favorites:', error);
            throw error;
        }
    });
}
exports.favoriteMusic = favoriteMusic;
//# sourceMappingURL=favorite-music-example.js.map