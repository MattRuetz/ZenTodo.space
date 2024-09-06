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
}

export interface TaskCardToolBarProps {
    onDelete: () => void;
    progress: TaskProgress;
    onProgressChange: (progress: TaskProgress) => void;
}

// NextAuth type extensions
declare module 'next-auth' {
    interface User {
        id: string;
    }

    interface Session {
        user: User & {
            id: string;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
    }
}
