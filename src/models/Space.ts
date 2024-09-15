// src/models/Space.ts
import { Tag } from '@/types';
import mongoose from 'mongoose';

interface ISpace extends Document {
    _id: string;
    name: string;
    color: string;
    userId: mongoose.Schema.Types.ObjectId;
    maxZIndex: number;
    tags: Tag[];
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
    tags: { type: Array, required: false },
});

export default mongoose.models.Space || mongoose.model('Space', SpaceSchema);
