import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from 'bcrypt';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

export enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher',
    ADMIN = 'admin'
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - username
 *         - password
 *         - age
 *         - gender
 *         - mobileNumber
 *         - role
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         username:
 *           type: string
 *           unique: true
 *         password:
 *           type: string
 *           format: password
 *           description: Hashed password (not returned in responses)
 *         age:
 *           type: number
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         mobileNumber:
 *           type: string
 *         role:
 *           type: string
 *           enum: [student, teacher, admin]
 *         class:
 *           type: string
 *         uid:
 *           type: string
 *           description: Unique identifier
 *         profileImage:
 *           type: string
 *           description: URL or path to user's profile picture
 *         syllabus:
 *           type: string
 *         favorites:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of music IDs that the user has favorited
 */
export interface IUser extends Document {
    _id:string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    email?: string;
    age: number;
    gender: string;
    mobileNumber: string;
    role: UserRole;
    class?: string;
    uid: string;
    profileImage?: string;
    syllabus?: string;
    favorites?: mongoose.Types.ObjectId[];
    comparePassword(candidatePassword: string): Promise<boolean>;
    fullName(): string;
}

interface IUserModel extends Model<IUser> { 
    // can define static methods here
}

const UserSchema = new Schema<IUser, IUserModel>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Don't return password by default in queries
    },
    email: {
        type: String,
        required: false,
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    mobileNumber: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: Object.values(UserRole),
        default: UserRole.STUDENT
    },
    class: {
        type: String,
        required: false
    },
    uid: {
        type: String,
        required: true,
        index: { unique: true },
    },
    profileImage: {
        type: String,
        required: false
    },
    syllabus: {
        type: String,
        required: false
    },
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'Music'
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password along with the new salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        // We need to get the password field explicitly since it's not included by default
        const user = await this.model('User').findById(this._id).select('+password');
        if (!user || !user.password) {
            return false;
        }
        return bcrypt.compare(candidatePassword, user.password);
    } catch (error) {
        return false;
    }
};

// Method to get full name
UserSchema.methods.fullName = function(): string {
    return this.firstName + " " + this.lastName;
};

const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
export default User;