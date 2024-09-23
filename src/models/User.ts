// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    themePreference: {
        type: String;
        enum: ['buji', 'daigo', 'enzu'];
        default: 'buji';
    };
}

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    themePreference: {
        type: String,
        enum: ['buji', 'daigo', 'enzu'],
        default: 'buji',
    },
});

export default mongoose.models.User ||
    mongoose.model<IUser>('User', UserSchema);
