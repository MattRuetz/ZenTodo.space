// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    name: string;
    profilePicture: string;
    email: string;
    password: string;
    themePreference: {
        type: String;
        enum: ['buji', 'daigo', 'enzu'];
        default: 'buji';
    };
    createdAt: Date;
    spacesCount: number;
    totalTasksCreated: number;
    tasksCompleted: number;
    tasksInProgress: number;
}

const UserSchema = new Schema({
    name: { type: String, required: true },
    profilePicture: {
        type: String,
        default: '/images/profile_picture_default.webp',
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    themePreference: {
        type: String,
        enum: ['buji', 'daigo', 'enzu'],
        default: 'buji',
    },
    createdAt: { type: Date, default: Date.now },
    spacesCount: { type: Number, default: 0 },
    totalTasksCreated: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    tasksInProgress: { type: Number, default: 0 },
});

export default mongoose.models.User ||
    mongoose.model<IUser>('User', UserSchema);
