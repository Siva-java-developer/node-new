import { Service } from "typedi";
import { UserRepository } from "../dao/user.repository";
import User, { UserRole } from "../model/user.model";
import UserResponseDTO, { BulkUploadResultDTO, UserCreationDTO } from "../dto/user.dto";
import CustomError from "../config/custom.error";
import mongoose from "mongoose";
import { HTTPStatusCode } from "../config/enum/http-status.code";
import Music, { IMusic } from "../model/music.model";
import { generateUID } from "../utils/excel.utils";

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
            console.log(`Adding favorite: userId=${userId}, musicId=${musicId}`);
            
            // Validate ObjectIds
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new CustomError("Invalid user ID format", HTTPStatusCode.BadRequest);
            }
            if (!mongoose.Types.ObjectId.isValid(musicId)) {
                throw new CustomError("Invalid music ID format", HTTPStatusCode.BadRequest);
            }

            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                throw new CustomError("User not found", HTTPStatusCode.NotFound);
            }
            console.log(`User found: ${user.username}, current favorites: ${user.favorites?.length || 0}`);

            // Check if music exists
            const music = await Music.findById(musicId);
            if (!music) {
                throw new CustomError("Music not found", HTTPStatusCode.NotFound);
            }
            console.log(`Music found: ${music.uid}`);

            // Initialize favorites array if it doesn't exist
            if (!user.favorites) {
                user.favorites = [];
            }

            // Check if music is already in favorites
            const isAlreadyFavorite = user.favorites.some(
                (favId) => favId.toString() === musicId
            );

            if (isAlreadyFavorite) {
                throw new CustomError(
                    "This music is already in your favorites",
                    HTTPStatusCode.Conflict
                );
            }

            // Add music to favorites
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { favorites: new mongoose.Types.ObjectId(musicId) } },
                { new: true }
            );
            
            console.log(`Updated user favorites count: ${updatedUser?.favorites?.length || 0}`);
        } catch (error: any) {
            console.error(`Error adding favorite: ${error.message}`);
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
            console.log(`Getting favorites for userId: ${userId}`);
            
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new CustomError("Invalid user ID format", HTTPStatusCode.BadRequest);
            }

            // Check if user exists and populate favorites
            const user = await User.findById(userId).populate('favorites');
            if (!user) {
                throw new CustomError("User not found", HTTPStatusCode.NotFound);
            }

            console.log(`User found: ${user.username}`);
            console.log(`Raw favorites array:`, user.favorites);
            console.log(`Favorites count: ${user.favorites?.length || 0}`);

            // Return populated favorites
            const favorites = user.favorites as unknown as IMusic[] || [];
            console.log(`Returning ${favorites.length} favorites`);
            return favorites;
        } catch (error: any) {
            console.error(`Error getting favorites: ${error.message}`);
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

    /**
     * Get raw user data with favorites (for debugging)
     */
    async getRawUserWithFavorites(userId: string): Promise<any> {
        try {
            const user = await User.findById(userId).lean();
            if (!user) {
                throw new CustomError("User not found", HTTPStatusCode.NotFound);
            }
            return user;
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(
                `Failed to get raw user data: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Bulk create users from Excel upload
     * @param users Array of user data from Excel
     * @returns Result of bulk upload operation
     */
    async bulkCreateUsers(users: UserCreationDTO[]): Promise<BulkUploadResultDTO> {
        const result: BulkUploadResultDTO = {
            totalProcessed: users.length,
            successful: 0,
            failed: 0,
            errors: []
        };

        // Process each user
        for (let i = 0; i < users.length; i++) {
            try {
                const userData = users[i];
                
                // Validate required fields
                if (!userData.firstName || !userData.lastName || !userData.username || 
                    !userData.password || !userData.age || !userData.gender || 
                    !userData.mobileNumber || !userData.role) {
                    throw new Error("Missing required fields");
                }

                // Generate UID
                const uid = generateUID();
                
                // Create user with UID
                await User.create({
                    ...userData,
                    uid
                });
                
                result.successful++;
            } catch (error: any) {
                result.failed++;
                result.errors.push({
                    index: i,
                    username: users[i].username || `Row ${i + 2}`, // +2 because Excel is 1-indexed and has a header row
                    error: error.code === 11000 
                        ? "Username or email already exists" 
                        : error.message || "Unknown error"
                });
            }
        }
        
        return result;
    }
}

export default UserService