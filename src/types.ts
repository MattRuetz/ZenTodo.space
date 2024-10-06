// src/types.ts
export type TaskProgress =
    | 'Not Started'
    | 'In Progress'
    | 'Blocked'
    | 'Complete';

// Task does not get an ID until it is saved to DB
export interface Task {
    _id?: string;
    taskName: string;
    taskDescription: string;
    x: number;
    y: number;
    width: number;
    height: number;
    progress: TaskProgress;
    space: string | null;
    zIndex: number;
    subtasks: string[];
    parentTask?: string;
    createdAt?: Date;
    updatedAt?: Date;
    ancestors?: string[];
    dueDate?: Date | null;
    emoji?: string;
    isTemp?: boolean;
    isArchived?: boolean;
    archivedAt?: Date;
    clientId?: string;
}

export interface SpaceData {
    _id?: string;
    name: string;
    color: string;
    order: number;
    maxZIndex: number;
    emoji: string;
    selectedEmojis: string[];
    taskOrder: string[];
    wallpaper: string;
    backgroundColor: string;
}

export interface User {
    _id?: string;
    clerkId: string;
    themePreference: ThemeName;
    spacesCount: number;
    totalTasksCreated: number;
    tasksCompleted: number;
    tasksInProgress: number;
    createdAt?: Date;
}

export type SortOption =
    | 'custom'
    | 'name'
    | 'dueDate'
    | 'progress'
    | 'created'
    | 'lastEdited';

export type ThemeName = 'buji' | 'daigo' | 'enzu';
