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
    space: { type: String; required: true };
}

const TaskSchema = new mongoose.Schema({
    taskName: { type: String, required: false },
    taskDescription: { type: String, required: false },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    zIndex: { type: Number, required: true, default: 1 },
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
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    parentTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: false,
    },
});

// Add this line to create the compound index
TaskSchema.index({ userId: 1, spaceId: 1 });

TaskSchema.pre('save', async function (next) {
    if (this.isNew && !this.zIndex) {
        const space = await mongoose.model('Space').findById(this.space);
        if (space) {
            this.zIndex = (space.maxZIndex || 0) + 1;
            await space.updateOne({ maxZIndex: this.zIndex });
        } else {
            this.zIndex = 1;
        }
    }
    next();
});

export default mongoose.models.Task ||
    mongoose.model<ITask>('Task', TaskSchema);
