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
    spaceId: String;
}

export interface SpaceData {
    _id?: string;
    name: string;
    color: string;
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
