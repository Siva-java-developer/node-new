import { PlaylistRepository } from "../dao/playlist.repository";
import { 
    CreatePlaylistDto, 
    UpdatePlaylistDto, 
    AddSongToPlaylistDto, 
    RemoveSongFromPlaylistDto,
    SharePlaylistDto,
    PlaylistResponseDto,
    PlaylistSummaryDto,
    ReorderSongsDto,
    PlaylistSearchDto
} from "../dto/playlist.dto";
import { IPlaylist } from "../model/playlist.model";
import CustomError from "../config/custom.error";
import { HTTPStatusCode } from "../config/enum/http-status.code";
import { ErrorMessages } from "../config/enum/error-messages.enum";

export class PlaylistService {
    private playlistRepository: PlaylistRepository;

    constructor() {
        this.playlistRepository = new PlaylistRepository();
    }

    async createPlaylist(playlistData: CreatePlaylistDto, userId: string): Promise<PlaylistResponseDto> {
        try {
            const playlist = await this.playlistRepository.create(playlistData, userId);
            return this.mapToResponseDto(playlist);
        } catch (error: any) {
            throw new CustomError(
                `${ErrorMessages.PLAYLIST_CREATION_FAILED}: ${error.message}`,
                HTTPStatusCode.InternalServerError
            );
        }
    }

    async getPlaylistById(playlistId: string, userId: string): Promise<PlaylistResponseDto> {
        const playlist = await this.playlistRepository.findById(playlistId);
        
        if (!playlist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_NOT_FOUND,
                HTTPStatusCode.NotFound
            );
        }

        return this.mapToResponseDto(playlist);
    }

    async getPlaylistByUid(uid: string, userId: string): Promise<PlaylistResponseDto> {
        const playlist = await this.playlistRepository.findByUid(uid);
        
        if (!playlist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_NOT_FOUND,
                HTTPStatusCode.NotFound
            );
        }

        return this.mapToResponseDto(playlist);
    }

    async getUserPlaylists(userId: string, page: number = 1, limit: number = 10): Promise<{
        playlists: PlaylistSummaryDto[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const [playlists, total] = await Promise.all([
            this.playlistRepository.findByOwner(userId, page, limit),
            this.playlistRepository.countByOwner(userId)
        ]);

        const mappedPlaylists = playlists.map(playlist => {
            try {
                return this.mapToSummaryDto(playlist);
            } catch (error) {
                console.error('Error mapping playlist to summary DTO:', error);
                console.error('Playlist data:', playlist);
                throw error;
            }
        });

        return {
            playlists: mappedPlaylists,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getAccessiblePlaylists(userId: string, page: number = 1, limit: number = 10): Promise<{
        playlists: PlaylistSummaryDto[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const [playlists, total] = await Promise.all([
            this.playlistRepository.findAccessiblePlaylists(userId, page, limit),
            this.playlistRepository.countAccessiblePlaylists(userId)
        ]);

        return {
            playlists: playlists.map(playlist => this.mapToSummaryDto(playlist)),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getPublicPlaylists(page: number = 1, limit: number = 10): Promise<{
        playlists: PlaylistSummaryDto[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const [playlists, total] = await Promise.all([
            this.playlistRepository.findPublicPlaylists(page, limit),
            this.playlistRepository.countPublicPlaylists()
        ]);

        return {
            playlists: playlists.map(playlist => this.mapToSummaryDto(playlist)),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getSharedPlaylists(userId: string, page: number = 1, limit: number = 10): Promise<PlaylistSummaryDto[]> {
        // Sharing functionality has been removed
        // Return empty array with a note in the logs
        console.log('Sharing functionality has been removed. Use getPublicPlaylists() instead.');
        return [];
    }

    async updatePlaylist(playlistId: string, updateData: UpdatePlaylistDto, userId: string): Promise<PlaylistResponseDto> {
        const playlist = await this.playlistRepository.findById(playlistId);
        
        if (!playlist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_NOT_FOUND,
                HTTPStatusCode.NotFound
            );
        }

        const updatedPlaylist = await this.playlistRepository.update(playlistId, updateData);
        
        if (!updatedPlaylist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_UPDATE_FAILED,
                HTTPStatusCode.InternalServerError
            );
        }

        return this.mapToResponseDto(updatedPlaylist);
    }

    async deletePlaylist(playlistId: string, userId: string): Promise<boolean> {
        const playlist = await this.playlistRepository.findById(playlistId);
        
        if (!playlist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_NOT_FOUND,
                HTTPStatusCode.NotFound
            );
        }

        return await this.playlistRepository.delete(playlistId);
    }

    async addSongToPlaylist(playlistId: string, songData: AddSongToPlaylistDto, userId: string): Promise<PlaylistResponseDto> {
        console.log('=== addSongToPlaylist Debug ===');
        console.log('Playlist ID:', playlistId);
        console.log('User ID from service:', userId, '(type:', typeof userId, ')');
        
        const playlist = await this.playlistRepository.findById(playlistId);
        
        if (!playlist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_NOT_FOUND,
                HTTPStatusCode.NotFound
            );
        }

        console.log('Found playlist:', playlist.name);
        console.log('Playlist owner from DB:', playlist.owner);
        console.log('Proceeding with adding song');
        console.log('================================');

        const updatedPlaylist = await this.playlistRepository.addSong(playlistId, songData.songId);
        
        if (!updatedPlaylist) {
            throw new CustomError(
                ErrorMessages.SONG_ADD_FAILED,
                HTTPStatusCode.InternalServerError
            );
        }

        // Update total duration
        await this.playlistRepository.updateTotalDuration(playlistId);

        return this.mapToResponseDto(updatedPlaylist);
    }

    async removeSongFromPlaylist(playlistId: string, songData: RemoveSongFromPlaylistDto, userId: string): Promise<PlaylistResponseDto> {
        const playlist = await this.playlistRepository.findById(playlistId);
        
        if (!playlist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_NOT_FOUND,
                HTTPStatusCode.NotFound
            );
        }

        const updatedPlaylist = await this.playlistRepository.removeSong(playlistId, songData.songId);
        
        if (!updatedPlaylist) {
            throw new CustomError(
                ErrorMessages.SONG_REMOVE_FAILED,
                HTTPStatusCode.InternalServerError
            );
        }

        // Update total duration
        await this.playlistRepository.updateTotalDuration(playlistId);

        return this.mapToResponseDto(updatedPlaylist);
    }

    async reorderSongs(playlistId: string, reorderData: ReorderSongsDto, userId: string): Promise<PlaylistResponseDto> {
        const playlist = await this.playlistRepository.findById(playlistId);
        
        if (!playlist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_NOT_FOUND,
                HTTPStatusCode.NotFound
            );
        }

        const updatedPlaylist = await this.playlistRepository.reorderSongs(playlistId, reorderData.songIds);
        
        if (!updatedPlaylist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_REORDER_FAILED,
                HTTPStatusCode.InternalServerError
            );
        }

        return this.mapToResponseDto(updatedPlaylist);
    }

    async sharePlaylist(playlistId: string, shareData: SharePlaylistDto, userId: string): Promise<PlaylistResponseDto> {
        const playlist = await this.playlistRepository.findById(playlistId);
        
        if (!playlist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_NOT_FOUND,
                HTTPStatusCode.NotFound
            );
        }

        // Sharing functionality has been removed
        // Return the playlist as is with a note in the logs
        console.log('Sharing functionality has been removed. To make a playlist accessible, set it to public.');
        
        return this.mapToResponseDto(playlist);
    }

    async unsharePlaylist(playlistId: string, userIds: string[], userId: string): Promise<PlaylistResponseDto> {
        const playlist = await this.playlistRepository.findById(playlistId);
        
        if (!playlist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_NOT_FOUND,
                HTTPStatusCode.NotFound
            );
        }

        // Sharing functionality has been removed
        // Return the playlist as is with a note in the logs
        console.log('Sharing functionality has been removed. Playlist access is now controlled only by visibility setting.');
        
        return this.mapToResponseDto(playlist);
    }

    async playPlaylist(playlistId: string, userId: string): Promise<PlaylistResponseDto> {
        const playlist = await this.playlistRepository.findById(playlistId);
        
        if (!playlist) {
            throw new CustomError(
                ErrorMessages.PLAYLIST_NOT_FOUND,
                HTTPStatusCode.NotFound
            );
        }

        // Increment play count
        await this.playlistRepository.incrementPlayCount(playlistId);

        return this.mapToResponseDto(playlist);
    }

    async searchPlaylists(searchParams: PlaylistSearchDto): Promise<PlaylistSummaryDto[]> {
        const playlists = await this.playlistRepository.search(searchParams);
        return playlists.map(playlist => this.mapToSummaryDto(playlist));
    }

    private mapToResponseDto(playlist: IPlaylist): PlaylistResponseDto {
        return {
            _id: playlist._id.toString(),
            name: playlist.name,
            description: playlist.description,
            owner: playlist.owner as any,
            visibility: playlist.visibility,
            songs: playlist.songs || [],
            totalDuration: playlist.totalDuration || 0,
            playCount: playlist.playCount || 0,
            thumbnail: playlist.thumbnail,
            uid: playlist.uid,
            createdAt: playlist.createdAt,
            updatedAt: playlist.updatedAt
        };
    }

    private mapToSummaryDto(playlist: IPlaylist): PlaylistSummaryDto {
        return {
            _id: playlist._id.toString(),
            name: playlist.name,
            description: playlist.description,
            owner: playlist.owner as any,
            visibility: playlist.visibility,
            songCount: playlist.songs ? playlist.songs.length : 0,
            totalDuration: playlist.totalDuration || 0,
            playCount: playlist.playCount || 0,
            thumbnail: playlist.thumbnail,
            uid: playlist.uid,
            createdAt: playlist.createdAt,
            updatedAt: playlist.updatedAt
        };
    }
}
