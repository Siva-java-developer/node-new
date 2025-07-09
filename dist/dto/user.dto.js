"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteMusicResponseDTO = exports.FavoriteMusicDTO = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class UserDTO {
    // Mapper function
    static toResponse(user) {
        const userDTO = new UserDTO();
        userDTO.id = user._id;
        userDTO.firstName = user.firstName;
        userDTO.lastName = user.lastName;
        userDTO.username = user.username;
        userDTO.email = user.email;
        userDTO.age = user.age;
        userDTO.gender = user.gender;
        userDTO.mobileNumber = user.mobileNumber;
        userDTO.role = user.role;
        userDTO.class = user.class;
        userDTO.syllabus = user.syllabus;
        userDTO.profileImage = user.profileImage;
        // Convert ObjectId array to string array for favorites
        if (user.favorites && user.favorites.length > 0) {
            userDTO.favorites = user.favorites.map(id => id.toString());
        }
        return userDTO;
    }
    static toRequest(user) {
        const request = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            age: user.age,
            gender: user.gender,
            mobileNumber: user.mobileNumber,
            role: user.role,
            class: user.class,
            syllabus: user.syllabus,
            profileImage: user.profileImage
        };
        // Convert string array to ObjectId array for favorites
        if (user.favorites && user.favorites.length > 0) {
            request.favorites = user.favorites.map(id => new mongoose_1.default.Types.ObjectId(id));
        }
        return request;
    }
}
exports.default = UserDTO;
// DTO for favorite music operations
class FavoriteMusicDTO {
}
exports.FavoriteMusicDTO = FavoriteMusicDTO;
// DTO for favorite music response
class FavoriteMusicResponseDTO {
    static toResponse(music) {
        const dto = new FavoriteMusicResponseDTO();
        dto.id = music._id.toString();
        dto.language = music.language;
        dto.syllabus = music.syllabus;
        dto.subject = music.subject;
        dto.class = music.class;
        dto.lyrics = music.lyrics;
        dto.music = music.music;
        dto.thumbnail = music.thumbnail;
        dto.duration = music.duration;
        dto.uid = music.uid;
        return dto;
    }
}
exports.FavoriteMusicResponseDTO = FavoriteMusicResponseDTO;
//# sourceMappingURL=user.dto.js.map