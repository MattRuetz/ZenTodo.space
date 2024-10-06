// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    clerkId: string;
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
    clerkId: { type: String, required: true, unique: true },
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
