// src/models/Task.ts
import { TaskProgress } from '@/types';
import mongoose, { Document, Model } from 'mongoose';

interface ITask extends Document {
    _id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    taskName: string;
    taskDescription: string;
    progress: TaskProgress;
    space: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    zIndex: number;
    subtasks: mongoose.Types.ObjectId[];
    parentTask?: mongoose.Types.ObjectId;
    ancestors: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    dueDate?: Date;
    emoji?: string;
    isArchived: boolean;
    archivedAt: Date;
}

const TaskSchema = new mongoose.Schema({
    taskName: { type: String, required: false },
    taskDescription: { type: String, required: false },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true, default: 250 },
    height: { type: Number, required: true, default: 230 },
    zIndex: { type: Number, required: true, default: 1 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    space: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Space',
        required: false,
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
    ancestors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    dueDate: { type: Date, required: false },
    emoji: { type: String, required: false },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, required: false },
});

// Add this line to create the compound index
TaskSchema.index({ userId: 1, spaceId: 1 });
TaskSchema.index({ user: 1, _id: 1 });
TaskSchema.index({ ancestors: 1 });

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

TaskSchema.pre(
    'deleteOne',
    { document: true, query: false },
    async function () {
        const task = this as unknown as ITask;
        // Find all subtasks and remove them
        await (this.constructor as Model<ITask>).deleteMany({
            parentTask: task._id,
        });
    }
);

export default mongoose.models.Task ||
    mongoose.model<ITask>('Task', TaskSchema);
