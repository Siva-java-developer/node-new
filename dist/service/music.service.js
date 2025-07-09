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
exports.MusicService = void 0;
const music_repository_1 = require("../dao/music.repository");
const custom_error_1 = __importDefault(require("../config/custom.error"));
const http_status_code_1 = require("../config/enum/http-status.code");
const user_model_1 = __importDefault(require("../model/user.model"));
/**
 * Service class for handling Music business logic
 */
class MusicService {
    constructor() {
        this.musicRepository = new music_repository_1.MusicRepository();
    }
    /**
     * Create a new music entry
     */
    createMusic(musicData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.musicRepository.createMusic(musicData);
        });
    }
    /**
     * Get all music entries
     */
    getAllMusic() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.musicRepository.getAllMusic();
        });
    }
    /**
     * Get music by ID
     */
    getMusicById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const music = yield this.musicRepository.getMusicById(id);
            if (!music) {
                throw new custom_error_1.default('Music not found', http_status_code_1.HTTPStatusCode.NotFound);
            }
            return music;
        });
    }
    /**
     * Get music by UID
     */
    getMusicByUid(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const music = yield this.musicRepository.getMusicByUid(uid);
            if (!music) {
                throw new custom_error_1.default('Music not found', http_status_code_1.HTTPStatusCode.NotFound);
            }
            return music;
        });
    }
    /**
     * Update music by ID
     */
    updateMusic(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const music = yield this.musicRepository.updateMusic(id, updateData);
            if (!music) {
                throw new custom_error_1.default('Music not found', http_status_code_1.HTTPStatusCode.NotFound);
            }
            return music;
        });
    }
    /**
     * Delete music by ID
     */
    deleteMusic(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleted = yield this.musicRepository.deleteMusic(id);
            if (!deleted) {
                throw new custom_error_1.default('Music not found', http_status_code_1.HTTPStatusCode.NotFound);
            }
        });
    }
    /**
     * Find music by filter criteria
     */
    findMusic(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.musicRepository.findMusic(filter);
        });
    }
    /**
     * Find music by language
     */
    findByLanguage(language) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.musicRepository.findMusic({ language });
        });
    }
    /**
     * Find music by syllabus
     */
    findBySyllabus(syllabus) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.musicRepository.findMusic({ syllabus });
        });
    }
    /**
     * Find music by subject
     */
    findBySubject(subject) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.musicRepository.findMusic({ subject });
        });
    }
    /**
     * Find music by class
     */
    findByClass(classLevel) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.musicRepository.findMusic({ class: classLevel });
        });
    }
    /**
     * Get music by filename
     */
    getMusicByFilename(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const music = yield this.musicRepository.findMusicByFilename(filename);
                if (!music) {
                    throw new custom_error_1.default(`Music with filename containing '${filename}' not found`, http_status_code_1.HTTPStatusCode.NotFound);
                }
                return music;
            }
            catch (error) {
                if (error instanceof custom_error_1.default) {
                    throw error;
                }
                throw new custom_error_1.default(`Error retrieving music by filename: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Get music with favorite status for a user
     */
    getMusicWithFavoriteStatus(musicId, userId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const music = yield this.musicRepository.getMusicById(musicId);
                if (!music) {
                    throw new custom_error_1.default('Music not found', http_status_code_1.HTTPStatusCode.NotFound);
                }
                // Check if music is in user's favorites
                const user = yield user_model_1.default.findById(userId);
                if (!user) {
                    throw new custom_error_1.default('User not found', http_status_code_1.HTTPStatusCode.NotFound);
                }
                const isFavorite = ((_a = user.favorites) === null || _a === void 0 ? void 0 : _a.some((favId) => favId.toString() === musicId)) || false;
                return { music, isFavorite };
            }
            catch (error) {
                if (error instanceof custom_error_1.default) {
                    throw error;
                }
                throw new custom_error_1.default(`Error retrieving music with favorite status: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Get all music with favorite status for a user
     */
    getAllMusicWithFavoriteStatus(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allMusic = yield this.musicRepository.getAllMusic();
                // Get user's favorites
                const user = yield user_model_1.default.findById(userId);
                if (!user) {
                    throw new custom_error_1.default('User not found', http_status_code_1.HTTPStatusCode.NotFound);
                }
                // Map music to include favorite status
                return allMusic.map(music => {
                    var _a;
                    const isFavorite = ((_a = user.favorites) === null || _a === void 0 ? void 0 : _a.some((favId) => favId.toString() === music._id.toString())) || false;
                    return { music, isFavorite };
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.default) {
                    throw error;
                }
                throw new custom_error_1.default(`Error retrieving all music with favorite status: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
}
exports.MusicService = MusicService;
//# sourceMappingURL=music.service.js.map