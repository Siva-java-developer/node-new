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
exports.updateMusicWithThumbnail = exports.getMusicWithThumbnail = exports.uploadMusicThumbnail = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const form_data_1 = __importDefault(require("form-data"));
/**
 * Example of how to upload a music thumbnail
 * @param thumbnailPath Path to the thumbnail image file
 * @returns Upload response with file path
 */
function uploadMusicThumbnail(thumbnailPath) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create form data
            const formData = new form_data_1.default();
            formData.append('imageFile', fs_1.default.createReadStream(thumbnailPath));
            // Set headers with authentication token
            const headers = Object.assign(Object.assign({}, formData.getHeaders()), { 'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE' });
            // Make API request
            const response = yield axios_1.default.post('http://localhost:3000/v1/music/upload/thumbnail', formData, { headers });
            console.log('Thumbnail uploaded successfully:');
            console.log('File path:', response.data.filePath);
            console.log('Message:', response.data.message);
            return response.data;
        }
        catch (error) {
            console.error('Error uploading thumbnail:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw error;
        }
    });
}
exports.uploadMusicThumbnail = uploadMusicThumbnail;
/**
 * Example of how to get music with thumbnail
 * @param musicId The ID of the music to get
 */
function getMusicWithThumbnail(musicId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Set headers with authentication token
            const headers = {
                'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE'
            };
            // Make API request
            const response = yield axios_1.default.get(`http://localhost:3000/v1/music/${musicId}`, { headers });
            const music = response.data.data;
            console.log('Music details:');
            console.log('Title:', music.subject);
            console.log('Thumbnail:', music.thumbnail || 'No thumbnail');
            console.log('Audio file:', music.music);
            return music;
        }
        catch (error) {
            console.error('Error getting music:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw error;
        }
    });
}
exports.getMusicWithThumbnail = getMusicWithThumbnail;
/**
 * Example of how to update a music entry with a thumbnail
 * @param musicId The ID of the music to update
 * @param thumbnailPath Path to the thumbnail image
 */
function updateMusicWithThumbnail(musicId, thumbnailPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // First upload the thumbnail
            const uploadResult = yield uploadMusicThumbnail(thumbnailPath);
            // Then update the music entry with the thumbnail path
            const headers = {
                'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE',
                'Content-Type': 'application/json'
            };
            // Update the music entry with the thumbnail path
            const updateResponse = yield axios_1.default.put(`http://localhost:3000/v1/music/${musicId}`, { thumbnail: uploadResult.filePath }, { headers });
            console.log('Music updated with thumbnail successfully');
            return updateResponse.data;
        }
        catch (error) {
            console.error('Error updating music with thumbnail:', error);
            throw error;
        }
    });
}
exports.updateMusicWithThumbnail = updateMusicWithThumbnail;
//# sourceMappingURL=music-thumbnail-example.js.map