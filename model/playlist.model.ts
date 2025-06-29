import mongoose, { Schema, Model, Document } from "mongoose";

/**
 * @swagger
 * tags:
 *   name: Playlist
 *   description: Playlist management API
 */

export enum PlaylistVisibility {
    PRIVATE = 'private',
    PUBLIC = 'public'
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Playlist:
 *       type: object
 *       required:
 *         - name
 *         - owner
 *         - visibility
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         name:
 *           type: string
 *           description: Name of the playlist
 *         description:
 *           type: string
 *           description: Description of the playlist
 *         owner:
 *           type: string
 *           description: User ID of the playlist owner
 *         visibility:
 *           type: string
 *           enum: [private, public]
 *           description: Visibility setting of the playlist
 *         songs:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of music IDs in the playlist
 *         totalDuration:
 *           type: number
 *           description: Total duration of all songs in the playlist (in seconds)
 *         playCount:
 *           type: number
 *           description: Number of times this playlist has been played
 *         thumbnail:
 *           type: string
 *           description: URL or path to the playlist thumbnail
 *         uid:
 *           type: string
 *           description: Unique identifier for the playlist
 */
export interface IPlaylist extends Document {
    name: string;
    description?: string;
    owner: mongoose.Types.ObjectId;
    visibility: PlaylistVisibility;
    songs: mongoose.Types.ObjectId[];
    totalDuration: number;
    playCount: number;
    thumbnail?: string;
    uid: string;
    createdAt: Date;
    updatedAt: Date;
}

interface IPlaylistModel extends Model<IPlaylist> {
    // can define static methods here
}

const PlaylistSchema = new Schema<IPlaylist, IPlaylistModel>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visibility: {
        type: String,
        enum: Object.values(PlaylistVisibility),
        default: PlaylistVisibility.PRIVATE,
        required: true
    },
    songs: [{
        type: Schema.Types.ObjectId,
        ref: 'Music'
    }],
    totalDuration: {
        type: Number,
        default: 0
    },
    playCount: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String,
        default: null
    },
    uid: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Index for efficient querying
PlaylistSchema.index({ owner: 1, name: 1 });
PlaylistSchema.index({ visibility: 1 });

const Playlist = mongoose.model<IPlaylist, IPlaylistModel>('Playlist', PlaylistSchema);
export default Playlist;