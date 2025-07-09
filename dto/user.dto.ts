import { IUser, UserRole } from "../model/user.model";
import { IMusic } from "../model/music.model";
import mongoose from "mongoose";

// DTO for bulk user upload
export interface BulkUserUploadDTO {
    users: UserCreationDTO[];
}

// DTO for user creation
export interface UserCreationDTO {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    age: number;
    gender: string;
    mobileNumber: string;
    role: UserRole;
    class?: string;
    syllabus?: string;
}

// DTO for bulk upload result
export interface BulkUploadResultDTO {
    totalProcessed: number;
    successful: number;
    failed: number;
    errors: Array<{
        index: number;
        username: string;
        error: string;
    }>;
}

export default class UserDTO {
    id!: string;
    firstName!: string;
    lastName!: string;
    username!: string;
    email!: string;
    age!: number;
    gender!: string;
    mobileNumber!: string;
    role!: UserRole;
    class!: string;
    syllabus!: string;
    profileImage?: string;
    favorites?: string[];
    
    // Mapper function
    static toResponse(user: IUser): UserDTO {
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

    static toRequest(user: UserDTO): any {
        const request: any = {
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
            request.favorites = user.favorites.map(id => new mongoose.Types.ObjectId(id));
        }

        return request;
    }
}

// DTO for favorite music operations
export class FavoriteMusicDTO {
    musicId!: string;
}

// DTO for favorite music response
export class FavoriteMusicResponseDTO {
    id!: string;
    title!: string;
    language!: string;
    syllabus!: string;
    subject!: string;
    class!: string;
    lyrics!: string;
    music!: string;
    thumbnail?: string;
    duration?: number;
    uid!: string;
    
    static toResponse(music: IMusic): FavoriteMusicResponseDTO {
        const dto = new FavoriteMusicResponseDTO();
        dto.id = music._id.toString();
        dto.title = music.title;
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