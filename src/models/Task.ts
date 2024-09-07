// src/models/Task.ts
import { TaskProgress } from '@/types';
import mongoose, { Document } from 'mongoose';

interface ITask extends Document {
    _id: string;
    x: number;
    y: number;
    taskName: string;
    taskDescription: string;
    progress: TaskProgress;
    spaceId: { type: String; required: true };
}

const TaskSchema = new mongoose.Schema({
    taskName: { type: String, required: false },
    taskDescription: { type: String, required: false },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    space: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Space',
        required: true,
    },
    progress: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Blocked', 'Complete'],
        default: 'Not Started',
    },
});

// Add this line to create the compound index
TaskSchema.index({ userId: 1, spaceId: 1 });

export default mongoose.models.Task ||
    mongoose.model<ITask>('Task', TaskSchema);
