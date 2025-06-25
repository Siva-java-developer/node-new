import mongoose from 'mongoose';
import Favorite, { IFavorite } from '../model/favorite.model';
import { AddFavoriteDto } from '../dto/favorite.dto';
import CustomError from '../config/custom.error';
import { HTTPStatusCode } from '../config/enum/http-status.code';

/**
 * Repository class for handling Favorite music data access operations
 */
export class FavoriteRepository {
    /**
     * Add a music to user's favorites
     */
    async addFavorite(favoriteData: AddFavoriteDto): Promise<IFavorite> {
        try {
            const favorite = new Favorite({
                userId: new mongoose.Types.ObjectId(favoriteData.userId),
                musicId: new mongoose.Types.ObjectId(favoriteData.musicId)
            });
            
            return await favorite.save();
        } catch (error: any) {
            // Check for duplicate key error (user already favorited this music)
            if (error.code === 11000) {
                throw new CustomError(
                    'This music is already in your favorites',
                    HTTPStatusCode.Conflict
                );
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
    async removeFavorite(userId: string, musicId: string): Promise<boolean> {
        try {
            const result = await Favorite.findOneAndDelete({
                userId: new mongoose.Types.ObjectId(userId),
                musicId: new mongoose.Types.ObjectId(musicId)
            });
            
            return !!result;
        } catch (error: any) {
            throw new CustomError(
                `Failed to remove favorite: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Get all favorites for a user
     */
    async getUserFavorites(userId: string): Promise<IFavorite[]> {
        try {
            return await Favorite.find({
                userId: new mongoose.Types.ObjectId(userId)
            });
        } catch (error: any) {
            throw new CustomError(
                `Failed to fetch user favorites: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Check if a music is in user's favorites
     */
    async isFavorite(userId: string, musicId: string): Promise<boolean> {
        try {
            const favorite = await Favorite.findOne({
                userId: new mongoose.Types.ObjectId(userId),
                musicId: new mongoose.Types.ObjectId(musicId)
            });
            
            return !!favorite;
        } catch (error: any) {
            throw new CustomError(
                `Failed to check favorite status: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Get all users who favorited a specific music
     */
    async getMusicFavoriteCount(musicId: string): Promise<number> {
        try {
            return await Favorite.countDocuments({
                musicId: new mongoose.Types.ObjectId(musicId)
            });
        } catch (error: any) {
            throw new CustomError(
                `Failed to count music favorites: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }
}