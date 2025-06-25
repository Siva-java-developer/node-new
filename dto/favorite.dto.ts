import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { IFavorite } from '../model/favorite.model';
import { IMusic } from '../model/music.model';

/**
 * Data Transfer Object for adding a favorite music
 */
export class AddFavoriteDto {
    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @IsMongoId()
    @IsNotEmpty()
    musicId: string;
}

/**
 * Data Transfer Object for favorite music response
 */
export class FavoriteResponseDto {
    id: string;
    userId: string;
    musicId: string;
    music?: IMusic;
    createdAt: Date;

    /**
     * Convert a favorite document to response DTO
     */
    static toResponse(favorite: IFavorite, music?: IMusic): FavoriteResponseDto {
        return {
            id: favorite._id.toString(),
            userId: favorite.userId.toString(),
            musicId: favorite.musicId.toString(),
            music: music,
            createdAt: favorite.createdAt
        };
    }
}