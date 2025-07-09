"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const typedi_1 = require("typedi");
const user_model_1 = __importDefault(require("../model/user.model"));
const user_dto_1 = __importDefault(require("../dto/user.dto"));
const custom_error_1 = __importDefault(require("../config/custom.error"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_code_1 = require("../config/enum/http-status.code");
const music_model_1 = __importDefault(require("../model/music.model"));
let UserService = class UserService {
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield user_model_1.default.find();
            const usersDTO = users.map((user) => user_dto_1.default.toResponse(user));
            return usersDTO;
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findById(id);
            if (!user) {
                throw new custom_error_1.default("User not found", 404);
            }
            return user_dto_1.default.toResponse(user);
        });
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield user_model_1.default.create(user);
            }
            catch (error) {
                if (error.code === 11000) {
                    throw new custom_error_1.default("Username already exists", 400);
                }
                throw error;
            }
        });
    }
    updateUser(id, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findById(id);
            if (!user) {
                throw new custom_error_1.default("User not found", 404);
            }
            try {
                yield user_model_1.default.findByIdAndUpdate(id, userData, { new: true });
            }
            catch (error) {
                if (error.code === 11000) {
                    throw new custom_error_1.default("Username already exists", 400);
                }
                throw error;
            }
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.default.findById(id);
            if (!user) {
                throw new custom_error_1.default("User not found", 404);
            }
            yield user_model_1.default.findByIdAndDelete(id);
        });
    }
    /**
     * Add a music to user's favorites
     */
    addFavoriteMusic(userId, musicId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Adding favorite: userId=${userId}, musicId=${musicId}`);
                // Validate ObjectIds
                if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                    throw new custom_error_1.default("Invalid user ID format", http_status_code_1.HTTPStatusCode.BadRequest);
                }
                if (!mongoose_1.default.Types.ObjectId.isValid(musicId)) {
                    throw new custom_error_1.default("Invalid music ID format", http_status_code_1.HTTPStatusCode.BadRequest);
                }
                // Check if user exists
                const user = yield user_model_1.default.findById(userId);
                if (!user) {
                    throw new custom_error_1.default("User not found", http_status_code_1.HTTPStatusCode.NotFound);
                }
                console.log(`User found: ${user.username}, current favorites: ${((_a = user.favorites) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
                // Check if music exists
                const music = yield music_model_1.default.findById(musicId);
                if (!music) {
                    throw new custom_error_1.default("Music not found", http_status_code_1.HTTPStatusCode.NotFound);
                }
                console.log(`Music found: ${music.uid}`);
                // Initialize favorites array if it doesn't exist
                if (!user.favorites) {
                    user.favorites = [];
                }
                // Check if music is already in favorites
                const isAlreadyFavorite = user.favorites.some((favId) => favId.toString() === musicId);
                if (isAlreadyFavorite) {
                    throw new custom_error_1.default("This music is already in your favorites", http_status_code_1.HTTPStatusCode.Conflict);
                }
                // Add music to favorites
                const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { $addToSet: { favorites: new mongoose_1.default.Types.ObjectId(musicId) } }, { new: true });
                console.log(`Updated user favorites count: ${((_b = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.favorites) === null || _b === void 0 ? void 0 : _b.length) || 0}`);
            }
            catch (error) {
                console.error(`Error adding favorite: ${error.message}`);
                if (error instanceof custom_error_1.default) {
                    throw error;
                }
                throw new custom_error_1.default(`Failed to add favorite: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Remove a music from user's favorites
     */
    removeFavoriteMusic(userId, musicId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user exists
                const user = yield user_model_1.default.findById(userId);
                if (!user) {
                    throw new custom_error_1.default("User not found", http_status_code_1.HTTPStatusCode.NotFound);
                }
                // Remove music from favorites
                yield user_model_1.default.findByIdAndUpdate(userId, { $pull: { favorites: new mongoose_1.default.Types.ObjectId(musicId) } }, { new: true });
            }
            catch (error) {
                if (error instanceof custom_error_1.default) {
                    throw error;
                }
                throw new custom_error_1.default(`Failed to remove favorite: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Get all favorite music for a user
     */
    getUserFavoriteMusic(userId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Getting favorites for userId: ${userId}`);
                // Validate ObjectId
                if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                    throw new custom_error_1.default("Invalid user ID format", http_status_code_1.HTTPStatusCode.BadRequest);
                }
                // Check if user exists and populate favorites
                const user = yield user_model_1.default.findById(userId).populate('favorites');
                if (!user) {
                    throw new custom_error_1.default("User not found", http_status_code_1.HTTPStatusCode.NotFound);
                }
                console.log(`User found: ${user.username}`);
                console.log(`Raw favorites array:`, user.favorites);
                console.log(`Favorites count: ${((_a = user.favorites) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
                // Return populated favorites
                const favorites = user.favorites || [];
                console.log(`Returning ${favorites.length} favorites`);
                return favorites;
            }
            catch (error) {
                console.error(`Error getting favorites: ${error.message}`);
                if (error instanceof custom_error_1.default) {
                    throw error;
                }
                throw new custom_error_1.default(`Failed to get favorite music: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Check if a music is in user's favorites
     */
    isMusicFavorite(userId, musicId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user exists
                const user = yield user_model_1.default.findById(userId);
                if (!user) {
                    throw new custom_error_1.default("User not found", http_status_code_1.HTTPStatusCode.NotFound);
                }
                // Check if music is in favorites
                return ((_a = user.favorites) === null || _a === void 0 ? void 0 : _a.some((favId) => favId.toString() === musicId)) || false;
            }
            catch (error) {
                if (error instanceof custom_error_1.default) {
                    throw error;
                }
                throw new custom_error_1.default(`Failed to check favorite status: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Get raw user data with favorites (for debugging)
     */
    getRawUserWithFavorites(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_model_1.default.findById(userId).lean();
                if (!user) {
                    throw new custom_error_1.default("User not found", http_status_code_1.HTTPStatusCode.NotFound);
                }
                return user;
            }
            catch (error) {
                if (error instanceof custom_error_1.default) {
                    throw error;
                }
                throw new custom_error_1.default(`Failed to get raw user data: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
};
UserService = __decorate([
    (0, typedi_1.Service)()
], UserService);
exports.default = UserService;
//# sourceMappingURL=user.service.js.map