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
    space: string;
    zIndex: number;
    subtasks: Task[];
    parentTask?: string;
    createdAt?: Date;
    updatedAt?: Date;
    ancestors?: string[];
    dueDate?: Date;
    emoji?: string;
}

export interface SpaceData {
    _id?: string;
    name: string;
    color: string;
    maxZIndex: number;
    emoji: string;
    selectedEmojis: string[];
}

export type SortOption =
    | 'name'
    | 'progress'
    | 'created'
    | 'lastEdited'
    | 'custom';

// NextAuth type extensions
declare module 'next-auth' {
    interface User {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    }

    interface Session {
        user: User & {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
    }
}
