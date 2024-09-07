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
    progress: TaskProgress;
    isVirgin: boolean;
    space: String;
    zIndex: number; // Add this line
    // subtasks: string[]; // Array of subtask IDs
    // parentTask?: string; // ID of the parent task, if this is a subtask
}

export interface SpaceData {
    _id?: string;
    name: string;
    color: string;
    maxZIndex: number;
}

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
