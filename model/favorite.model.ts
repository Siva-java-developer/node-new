import mongoose, { Schema, Model, Document } from "mongoose";

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: User favorite music management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       required:
 *         - userId
 *         - musicId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         userId:
 *           type: string
 *           description: ID of the user who favorited the music
 *         musicId:
 *           type: string
 *           description: ID of the favorited music
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the favorite was added
 */
export interface IFavorite extends Document {
    userId: mongoose.Types.ObjectId;
    musicId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

interface IFavoriteModel extends Model<IFavorite> {
    // can define static methods here
}

const FavoriteSchema = new Schema<IFavorite, IFavoriteModel>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    musicId: {
        type: Schema.Types.ObjectId,
        ref: 'Music',
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create a compound index to ensure a user can only favorite a music once
FavoriteSchema.index({ userId: 1, musicId: 1 }, { unique: true });

const Favorite = mongoose.model<IFavorite, IFavoriteModel>('Favorite', FavoriteSchema);
export default Favorite;