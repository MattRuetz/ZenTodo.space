// src/models/Space.ts
import mongoose from 'mongoose';

interface ISpace extends Document {
    _id: string;
    name: string;
    color: string;
    uderId: mongoose.Schema.Types.ObjectId;
    maxZIndex: number;
    emoji: string;
    selectedEmojis: string[];
}

const SpaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    maxZIndex: { type: Number, default: 1 },
    emoji: { type: String, default: '' },
    selectedEmojis: { type: [String], default: [] },
});

export default mongoose.models.Space || mongoose.model('Space', SpaceSchema);
