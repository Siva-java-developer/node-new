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
exports.MusicRepository = void 0;
const uuid_1 = require("uuid");
const music_model_1 = __importDefault(require("../model/music.model"));
const custom_error_1 = __importDefault(require("../config/custom.error"));
const http_status_code_1 = require("../config/enum/http-status.code");
/**
 * Repository class for handling Music data access operations
 */
class MusicRepository {
    /**
     * Create a new music entry
     */
    createMusic(musicData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const music = new music_model_1.default(Object.assign(Object.assign({}, musicData), { uid: (0, uuid_1.v4)() }));
                return yield music.save();
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to create music: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Get all music entries
     */
    getAllMusic() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield music_model_1.default.find();
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to fetch music entries: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Get music by ID
     */
    getMusicById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const music = yield music_model_1.default.findById(id);
                return music;
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to fetch music: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Get music by UID
     */
    getMusicByUid(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const music = yield music_model_1.default.findOne({ uid });
                return music;
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to fetch music: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Update music by ID
     */
    updateMusic(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const music = yield music_model_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
                return music;
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to update music: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Delete music by ID
     */
    deleteMusic(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield music_model_1.default.findByIdAndDelete(id);
                return !!result;
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to delete music: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Find music by filter criteria
     */
    findMusic(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield music_model_1.default.find(filter);
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to find music: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
    /**
     * Find music by filename
     */
    findMusicByFilename(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First try to find by exact match in the music field
                let music = yield music_model_1.default.findOne({
                    music: { $regex: filename, $options: 'i' }
                });
                if (!music) {
                    // If not found, try to find by partial match in the music field
                    music = yield music_model_1.default.findOne({
                        music: { $regex: new RegExp(filename.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') }
                    });
                }
                if (!music) {
                    // If still not found, try to find by uid or any other field that might contain the filename
                    music = yield music_model_1.default.findOne({
                        $or: [
                            { uid: { $regex: new RegExp(filename.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') } },
                            { music: { $exists: true } } // Fallback to any music document if we can't find by filename
                        ]
                    });
                }
                return music;
            }
            catch (error) {
                throw new custom_error_1.default(`Failed to find music by filename: ${error.message}`, http_status_code_1.HTTPStatusCode.InternalServerError);
            }
        });
    }
}
exports.MusicRepository = MusicRepository;
//# sourceMappingURL=music.repository.js.map