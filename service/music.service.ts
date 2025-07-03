import { MusicRepository } from '../dao/music.repository';
import { CreateMusicDto, UpdateMusicDto } from '../dto/music.dto';
import { IMusic } from '../model/music.model';
import CustomError from '../config/custom.error';
import { HTTPStatusCode } from '../config/enum/http-status.code';
import User from '../model/user.model';

/**
 * Service class for handling Music business logic
 */
export class MusicService {
    private musicRepository: MusicRepository;

    constructor() {
        this.musicRepository = new MusicRepository();
    }

    /**
     * Create a new music entry
     */
    async createMusic(musicData: CreateMusicDto): Promise<IMusic> {
        return await this.musicRepository.createMusic(musicData);
    }

    /**
     * Get all music entries
     */
    async getAllMusic(): Promise<IMusic[]> {
        return await this.musicRepository.getAllMusic();
    }

    /**
     * Get music by ID
     */
    async getMusicById(id: string): Promise<IMusic> {
        const music = await this.musicRepository.getMusicById(id);
        if (!music) {
            throw new CustomError('Music not found', HTTPStatusCode.NotFound);
        }
        return music;
    }

    /**
     * Get music by UID
     */
    async getMusicByUid(uid: string): Promise<IMusic> {
        const music = await this.musicRepository.getMusicByUid(uid);
        if (!music) {
            throw new CustomError('Music not found', HTTPStatusCode.NotFound);
        }
        return music;
    }

    /**
     * Update music by ID
     */
    async updateMusic(id: string, updateData: UpdateMusicDto): Promise<IMusic> {
        const music = await this.musicRepository.updateMusic(id, updateData);
        if (!music) {
            throw new CustomError('Music not found', HTTPStatusCode.NotFound);
        }
        return music;
    }

    /**
     * Delete music by ID
     */
    async deleteMusic(id: string): Promise<void> {
        const deleted = await this.musicRepository.deleteMusic(id);
        if (!deleted) {
            throw new CustomError('Music not found', HTTPStatusCode.NotFound);
        }
    }

    /**
     * Find music by filter criteria
     */
    async findMusic(filter: Record<string, any>): Promise<IMusic[]> {
        return await this.musicRepository.findMusic(filter);
    }

    /**
     * Find music by filter criteria with cursor-based pagination
     */
    async findMusicWithPagination(
        filter: Record<string, any>,
        cursor?: string,
        limit: number = 10,
        sortField: string = '_id',
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<{
        data: IMusic[];
        hasNextPage: boolean;
        nextCursor?: string;
        totalCount: number;
    }> {
        return await this.musicRepository.findMusicWithPagination(
            filter,
            cursor,
            limit,
            sortField,
            sortOrder
        );
    }

    /**
     * Find music by language
     */
    async findByLanguage(language: string): Promise<IMusic[]> {
        return await this.musicRepository.findMusic({ language });
    }

    /**
     * Find music by syllabus
     */
    async findBySyllabus(syllabus: string): Promise<IMusic[]> {
        return await this.musicRepository.findMusic({ syllabus });
    }

    /**
     * Find music by subject
     */
    async findBySubject(subject: string): Promise<IMusic[]> {
        return await this.musicRepository.findMusic({ subject });
    }

    /**
     * Find music by class
     */
    async findByClass(classLevel: string): Promise<IMusic[]> {
        return await this.musicRepository.findMusic({ class: classLevel });
    }

    /**
     * Get music by filename
     */
    async getMusicByFilename(filename: string): Promise<IMusic> {
        try {
            const music = await this.musicRepository.findMusicByFilename(filename);
            if (!music) {
                throw new CustomError(`Music with filename containing '${filename}' not found`, HTTPStatusCode.NotFound);
            }
            return music;
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(
                `Error retrieving music by filename: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Get music with favorite status for a user
     */
    async getMusicWithFavoriteStatus(musicId: string, userId: string): Promise<{ music: IMusic; isFavorite: boolean }> {
        try {
            const music = await this.musicRepository.getMusicById(musicId);
            if (!music) {
                throw new CustomError('Music not found', HTTPStatusCode.NotFound);
            }

            // Check if music is in user's favorites
            const user = await User.findById(userId);
            if (!user) {
                throw new CustomError('User not found', HTTPStatusCode.NotFound);
            }

            const isFavorite = user.favorites?.some(
                (favId) => favId.toString() === musicId
            ) || false;

            return { music, isFavorite };
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(
                `Error retrieving music with favorite status: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    /**
     * Get all music with favorite status for a user
     */
    async getAllMusicWithFavoriteStatus(userId: string): Promise<Array<{ music: IMusic; isFavorite: boolean }>> {
        try {
            const allMusic = await this.musicRepository.getAllMusic();
            
            // Get user's favorites
            const user = await User.findById(userId);
            if (!user) {
                throw new CustomError('User not found', HTTPStatusCode.NotFound);
            }

            // Map music to include favorite status
            return allMusic.map(music => {
                const isFavorite = user.favorites?.some(
                    (favId) => favId.toString() === music._id.toString()
                ) || false;

                return { music, isFavorite };
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(
                `Error retrieving all music with favorite status: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }
}