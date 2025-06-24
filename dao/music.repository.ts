import { v4 as uuidv4 } from 'uuid';
import Music, { IMusic } from '../model/music.model';
import { CreateMusicDto, UpdateMusicDto } from '../dto/music.dto';
import CustomError from '../config/custom.error';
import { HTTPStatusCode } from '../config/enum/http-status.code';

/**
 * Repository class for handling Music data access operations
 */
export class MusicRepository {
    /**
     * Create a new music entry
     */
    async createMusic(musicData: CreateMusicDto): Promise<IMusic> {
        try {
            const music = new Music({
                ...musicData,
                uid: uuidv4()
            });
            
            return await music.save();
        } catch (error: any) {
            throw new CustomError(
                `Failed to create music: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Get all music entries
     */
    async getAllMusic(): Promise<IMusic[]> {
        try {
            return await Music.find();
        } catch (error: any) {
            throw new CustomError(
                `Failed to fetch music entries: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Get music by ID
     */
    async getMusicById(id: string): Promise<IMusic | null> {
        try {
            const music = await Music.findById(id);
            return music;
        } catch (error: any) {
            throw new CustomError(
                `Failed to fetch music: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Get music by UID
     */
    async getMusicByUid(uid: string): Promise<IMusic | null> {
        try {
            const music = await Music.findOne({ uid });
            return music;
        } catch (error: any) {
            throw new CustomError(
                `Failed to fetch music: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Update music by ID
     */
    async updateMusic(id: string, updateData: UpdateMusicDto): Promise<IMusic | null> {
        try {
            const music = await Music.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );
            return music;
        } catch (error: any) {
            throw new CustomError(
                `Failed to update music: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Delete music by ID
     */
    async deleteMusic(id: string): Promise<boolean> {
        try {
            const result = await Music.findByIdAndDelete(id);
            return !!result;
        } catch (error: any) {
            throw new CustomError(
                `Failed to delete music: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Find music by filter criteria
     */
    async findMusic(filter: Record<string, any>): Promise<IMusic[]> {
        try {
            return await Music.find(filter);
        } catch (error: any) {
            throw new CustomError(
                `Failed to find music: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Find music by filename
     */
    async findMusicByFilename(filename: string): Promise<IMusic | null> {
        try {
            // First try to find by exact match in the music field
            let music = await Music.findOne({ 
                music: { $regex: filename, $options: 'i' } 
            });
            
            if (!music) {
                // If not found, try to find by partial match in the music field
                music = await Music.findOne({
                    music: { $regex: new RegExp(filename.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') }
                });
            }
            
            if (!music) {
                // If still not found, try to find by uid or any other field that might contain the filename
                music = await Music.findOne({
                    $or: [
                        { uid: { $regex: new RegExp(filename.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') } },
                        { music: { $exists: true } } // Fallback to any music document if we can't find by filename
                    ]
                });
            }
            
            return music;
        } catch (error: any) {
            throw new CustomError(
                `Failed to find music by filename: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }
}