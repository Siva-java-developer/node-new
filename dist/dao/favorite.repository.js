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
exports.FavoriteRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const favorite_model_1 = __importDefault(require("../model/favorite.model"));
const custom_error_1 = __importDefault(require("../config/custom.error"));
const http_status_code_1 = require("../config/enum/http-status.code");
/**
 * Repository class for handling Favorite music data access operations
 */
class FavoriteRepository {
    /**
     * Add a music to user's favorites
     */
    addFavorite(favoriteData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const favorite = new favorite_model_1.default({
                    userId: new mongoose_1.default.Types.ObjectId(favoriteData.userId),
                    musicId: new mongoose_1.default.Types.ObjectId(favoriteData.musicId)
                });
                return yield favorite.save();
            }
            catch (error) {
                // Check for duplicate key error (user already favorited this music)
                if (error.code === 11000) {
                    throw new custom_error_1.default('This music is already in your favorites', http_status_code_1.HTTPStatusCode.Conflict);
                }
                throw new custom_error_1.default(`Failed to add favorite: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Remove a music from user's favorites
     */
    removeFavorite(userId, musicId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield favorite_model_1.default.findOneAndDelete({
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    musicId: new mongoose_1.default.Types.ObjectId(musicId)
                });
                return !!result;
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to remove favorite: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Get all favorites for a user
     */
    getUserFavorites(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield favorite_model_1.default.find({
                    userId: new mongoose_1.default.Types.ObjectId(userId)
                });
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to fetch user favorites: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Check if a music is in user's favorites
     */
    isFavorite(userId, musicId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const favorite = yield favorite_model_1.default.findOne({
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    musicId: new mongoose_1.default.Types.ObjectId(musicId)
                });
                return !!favorite;
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to check favorite status: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Get all users who favorited a specific music
     */
    getMusicFavoriteCount(musicId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield favorite_model_1.default.countDocuments({
                    musicId: new mongoose_1.default.Types.ObjectId(musicId)
                });
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to count music favorites: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
}
exports.FavoriteRepository = FavoriteRepository;
//# sourceMappingURL=favorite.repository.js.map