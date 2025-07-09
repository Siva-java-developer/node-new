import { PlaylistVisibility } from "../model/playlist.model";

export interface CreatePlaylistDto {
    name: string;
    description?: string;
    visibility?: PlaylistVisibility;
    thumbnail?: string;
}

export interface CreatePlaylistWithFileDto {
    name: string;
    description?: string;
    visibility?: PlaylistVisibility;
}

export interface UpdatePlaylistDto {
    name?: string;
    description?: string;
    visibility?: PlaylistVisibility;
    thumbnail?: string;
}

export interface UpdatePlaylistWithFileDto {
    name?: string;
    description?: string;
    visibility?: PlaylistVisibility;
}

export interface AddSongToPlaylistDto {
    songIds: string[];
}

export interface RemoveSongFromPlaylistDto {
    songId: string;
}

// Sharing functionality has been removed
export interface SharePlaylistDto {
    userIds: string[];
    canEdit?: boolean;
}

export interface PlaylistResponseDto {
    _id: string;
    name: string;
    description?: string;
    owner: {
        _id: string;
        firstName: string;
        lastName: string;
        username: string;
    };
    visibility: PlaylistVisibility;
    songs: any[];
    totalDuration: number;
    playCount: number;
    thumbnail?: string;
    uid: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PlaylistSummaryDto {
    _id: string;
    name: string;
    description?: string;
    owner: {
        _id: string;
        firstName: string;
        lastName: string;
        username: string;
    };
    visibility: PlaylistVisibility;
    songCount: number;
    totalDuration: number;
    playCount: number;
    thumbnail?: string;
    uid: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReorderSongsDto {
    songIds: string[];
}

export interface PlaylistSearchDto {
    name?: string;
    owner?: string;
    visibility?: PlaylistVisibility;
    page?: number;
    limit?: number;
}

export interface GetThumbnailsDto {
    filenames: string[];
}

export interface ThumbnailResponseDto {
    filename: string;
    content: string;
    mimeType: string;
    mediaType: string;
    size: number;
}