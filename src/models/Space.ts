// src/models/Space.ts
import mongoose from 'mongoose';

interface ISpace extends Document {
    _id: string;
    name: string;
    color: string;
    order: number;
    userId: mongoose.Schema.Types.ObjectId;
    maxZIndex: number;
    emoji: string;
    selectedEmojis: string[];
    taskOrder: string[];
    wallpaper: string;
    backgroundColor: string;
}

const SpaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String, required: true },
    order: { type: Number, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    maxZIndex: { type: Number, default: 1 },
    emoji: { type: String, default: '' },
    selectedEmojis: { type: [String], default: [] },
    taskOrder: { type: [String], default: [] },
    wallpaper: { type: String, default: '/images/placeholder_image.webp' },
    backgroundColor: { type: String, default: '' },
});

export default mongoose.models.Space || mongoose.model('Space', SpaceSchema);
