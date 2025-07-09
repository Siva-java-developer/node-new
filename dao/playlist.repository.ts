import Playlist, { IPlaylist, PlaylistVisibility } from "../model/playlist.model";
import { CreatePlaylistDto, UpdatePlaylistDto, PlaylistSearchDto } from "../dto/playlist.dto";
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

export class PlaylistRepository {
    
    async create(playlistData: CreatePlaylistDto, ownerId: string): Promise<IPlaylist> {
    const playlist = new Playlist({
      ...playlistData,
      owner: new mongoose.Types.ObjectId(ownerId),
      uid: uuidv4(),
            visibility: playlistData.visibility || PlaylistVisibility.PRIVATE
    });

    return await playlist.save();
  }

  async findById(id: string): Promise<IPlaylist | null> {
    return await Playlist.findById(id)
            .populate('owner', 'firstName lastName username')
            .populate('songs', 'title music duration thumbnail uid');
  }

  async findByUid(uid: string): Promise<IPlaylist | null> {
    return await Playlist.findOne({ uid })
            .populate('owner', 'firstName lastName username')
            .populate('songs', 'title music duration thumbnail uid');
  }

    async findByOwner(ownerId: string, page: number = 1, limit: number = 10): Promise<IPlaylist[]> {
    return await Playlist.find({ owner: new mongoose.Types.ObjectId(ownerId) })
            .populate('owner', 'firstName lastName username')
            .populate('songs', 'title music duration thumbnail uid')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

    async findAccessiblePlaylists(userId: string, page: number = 1, limit: number = 10): Promise<IPlaylist[]> {
    // Return all playlists without permission checks
    return await Playlist.find({})
        .populate('owner', 'firstName lastName username')
        .populate('songs', 'title music duration thumbnail uid')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

    async findPublicPlaylists(page: number = 1, limit: number = 10): Promise<IPlaylist[]> {
    return await Playlist.find({ visibility: PlaylistVisibility.PUBLIC })
            .populate('owner', 'firstName lastName username')
            .populate('songs', 'title music duration thumbnail uid')
      .sort({ playCount: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  // Shared playlists functionality has been removed
    async findSharedWithUser(userId: string, page: number = 1, limit: number = 10): Promise<IPlaylist[]> {
    // Return empty array since sharing functionality is removed
    return [];
  }

    async update(id: string, updateData: UpdatePlaylistDto): Promise<IPlaylist | null> {
    return await Playlist.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
        .populate('owner', 'firstName lastName username')
        .populate('songs', 'title music duration thumbnail uid');
  }

  async delete(id: string): Promise<boolean> {
    const result = await Playlist.findByIdAndDelete(id);
    return result !== null;
  }

  async addSong(
    playlistId: string,
    songId: string[]
  ): Promise<IPlaylist | null> {
    const objectIds = songId.map((id) => new mongoose.Types.ObjectId(id));
    return await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $addToSet: { songs: { $each: objectIds } },
      },
      { new: true }
    )
        .populate('owner', 'firstName lastName username')
        .populate('songs', 'title music duration thumbnail uid');
  }

    async removeSong(playlistId: string, songId: string): Promise<IPlaylist | null> {
    return await Playlist.findByIdAndUpdate(
      playlistId,
      {
                $pull: { songs: new mongoose.Types.ObjectId(songId) }
      },
      { new: true }
    )
        .populate('owner', 'firstName lastName username')
        .populate('songs', 'title music duration thumbnail uid');
  }

    async reorderSongs(playlistId: string, songIds: string[]): Promise<IPlaylist | null> {
        const objectIds = songIds.map(id => new mongoose.Types.ObjectId(id));

    return await Playlist.findByIdAndUpdate(
      playlistId,
      { $set: { songs: objectIds } },
      { new: true }
    )
        .populate('owner', 'firstName lastName username')
        .populate('songs', 'title music duration thumbnail uid');
  }

  // Sharing functionality has been removed
    async shareWithUsers(playlistId: string, userIds: string[], canEdit: boolean = false): Promise<IPlaylist | null> {
    // Return the playlist without changes since sharing is removed
    return await Playlist.findById(playlistId)
            .populate('owner', 'firstName lastName username')
            .populate('songs', 'title music duration thumbnail uid');
  }

  // Unsharing functionality has been removed
    async unshareWithUsers(playlistId: string, userIds: string[]): Promise<IPlaylist | null> {
    // Return the playlist without changes since sharing is removed
    return await Playlist.findById(playlistId)
            .populate('owner', 'firstName lastName username')
            .populate('songs', 'title music duration thumbnail uid');
  }

  async updateTotalDuration(playlistId: string): Promise<IPlaylist | null> {
        const playlist = await Playlist.findById(playlistId).populate('songs', 'duration');
    if (!playlist) return null;

    const totalDuration = playlist.songs.reduce((total: number, song: any) => {
      return total + (song.duration || 0);
    }, 0);

    playlist.totalDuration = totalDuration;
    return await playlist.save();
  }

  async incrementPlayCount(playlistId: string): Promise<IPlaylist | null> {
    return await Playlist.findByIdAndUpdate(
      playlistId,
      { $inc: { playCount: 1 } },
      { new: true }
    );
  }

  async search(searchParams: PlaylistSearchDto): Promise<IPlaylist[]> {
    const query: any = {};

    if (searchParams.name) {
            query.name = { $regex: searchParams.name, $options: 'i' };
    }

    if (searchParams.visibility) {
      query.visibility = searchParams.visibility;
    }

    if (searchParams.owner) {
      query.owner = new mongoose.Types.ObjectId(searchParams.owner);
    }

    const page = searchParams.page || 1;
    const limit = searchParams.limit || 10;

    return await Playlist.find(query)
            .populate('owner', 'firstName lastName username')
            .populate('songs', 'title music duration thumbnail uid')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async countByOwner(ownerId: string): Promise<number> {
        return await Playlist.countDocuments({ owner: new mongoose.Types.ObjectId(ownerId) });
  }

  async countAccessiblePlaylists(userId: string): Promise<number> {
    // Count all playlists without permission checks
    return await Playlist.countDocuments({});
  }

  async countPublicPlaylists(): Promise<number> {
        return await Playlist.countDocuments({ visibility: PlaylistVisibility.PUBLIC });
  }
}