import mongoose, { Schema, Model, Document } from "mongoose";

/**
 * @swagger
 * tags:
 *   name: Music
 *   description: Music module management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Music:
 *       type: object
 *       required:
 *         - language
 *         - syllabus
 *         - subject
 *         - class
 *         - lyrics
 *         - music
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         language:
 *           type: string
 *           description: Language of the music content
 *         syllabus:
 *           type: string
 *           description: Educational syllabus the music belongs to
 *         subject:
 *           type: string
 *           description: Subject related to the music content
 *         class:
 *           type: string
 *           description: Class/grade level for which the music is intended
 *         lyrics:
 *           type: string
 *           description: Lyrics or text content of the music
 *         music:
 *           type: string
 *           description: URL or path to the music file
 *         duration:
 *           type: number
 *           description: Duration of the music in seconds
 *         uid:
 *           type: string
 *           description: Unique identifier
 */
export interface IMusic extends Document {
    language: string;
    syllabus: string;
    subject: string;
    class: string;
    lyrics: string;
    music: string;
    duration: number;
    uid: string;
}

interface IMusicModel extends Model<IMusic> {
    // can define static methods here
}

const MusicSchema = new Schema<IMusic, IMusicModel>({
    language: {
        type: String,
        required: true
    },
    syllabus: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    lyrics: {
        type: String,
        required: true
    },
    music: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: 0
    },
    uid: {
        type: String,
        required: true,
        index: { unique: true },
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Music = mongoose.model<IMusic, IMusicModel>('Music', MusicSchema);
export default Music;