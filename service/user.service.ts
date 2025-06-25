import { Service } from "typedi";
import { UserRepository } from "../dao/user.repository";
import User from "../model/user.model";
import UserResponseDTO from "../dto/user.dto";
import CustomError from "../config/custom.error";
import mongoose from "mongoose";
import { HTTPStatusCode } from "../config/enum/http-status.code";
import Music, { IMusic } from "../model/music.model";

@Service()
class UserService implements UserRepository {
    async getUsers(): Promise<UserResponseDTO[]> {
        const users = await User.find();
        const usersDTO = users.map((user) => UserResponseDTO.toResponse(user));
        return usersDTO;
    }

    async getUserById(id: string): Promise<UserResponseDTO> {
        const user = await User.findById(id);
        if (!user) {
            throw new CustomError("User not found", 404);
        }
        return UserResponseDTO.toResponse(user);
    }

    async createUser(user: any): Promise<void> {
        try {
            await User.create(user);
        } catch (error: any) {
            if (error.code === 11000) {
                throw new CustomError("Username already exists", 400);
            }
            throw error;
        }
    }

    async updateUser(id: string, userData: any): Promise<void> {
        const user = await User.findById(id);
        if (!user) {
            throw new CustomError("User not found", 404);
        }
        
        try {
            await User.findByIdAndUpdate(id, userData, { new: true });
        } catch (error: any) {
            if (error.code === 11000) {
                throw new CustomError("Username already exists", 400);
            }
            throw error;
        }
    }

    async deleteUser(id: string): Promise<void> {
        const user = await User.findById(id);
        if (!user) {
            throw new CustomError("User not found", 404);
        }
        
        await User.findByIdAndDelete(id);
    }

    /**
     * Add a music to user's favorites
     */
    async addFavoriteMusic(userId: string, musicId: string): Promise<void> {
        try {
            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                throw new CustomError("User not found", HTTPStatusCode.NotFound);
            }

            // Check if music exists
            const music = await Music.findById(musicId);
            if (!music) {
                throw new CustomError("Music not found", HTTPStatusCode.NotFound);
            }

            // Check if music is already in favorites
            const isAlreadyFavorite = user.favorites?.some(
                (favId) => favId.toString() === musicId
            );

            if (isAlreadyFavorite) {
                throw new CustomError(
                    "This music is already in your favorites",
                    HTTPStatusCode.Conflict
                );
            }

            // Add music to favorites
            await User.findByIdAndUpdate(
                userId,
                { $addToSet: { favorites: new mongoose.Types.ObjectId(musicId) } },
                { new: true }
            );
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(
                `Failed to add favorite: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Remove a music from user's favorites
     */
    async removeFavoriteMusic(userId: string, musicId: string): Promise<void> {
        try {
            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                throw new CustomError("User not found", HTTPStatusCode.NotFound);
            }

            // Remove music from favorites
            await User.findByIdAndUpdate(
                userId,
                { $pull: { favorites: new mongoose.Types.ObjectId(musicId) } },
                { new: true }
            );
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(
                `Failed to remove favorite: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Get all favorite music for a user
     */
    async getUserFavoriteMusic(userId: string): Promise<IMusic[]> {
        try {
            // Check if user exists
            const user = await User.findById(userId).populate('favorites');
            if (!user) {
                throw new CustomError("User not found", HTTPStatusCode.NotFound);
            }

            // Return populated favorites
            return user.favorites as unknown as IMusic[] || [];
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(
                `Failed to get favorite music: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Check if a music is in user's favorites
     */
    async isMusicFavorite(userId: string, musicId: string): Promise<boolean> {
        try {
            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                throw new CustomError("User not found", HTTPStatusCode.NotFound);
            }

            // Check if music is in favorites
            return user.favorites?.some(
                (favId) => favId.toString() === musicId
            ) || false;
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(
                `Failed to check favorite status: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }
}

export default UserService