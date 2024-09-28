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
}

export interface SpaceData {
    _id?: string;
    name: string;
    color: string;
    order: number;
    maxZIndex: number;
    emoji: string;
    selectedEmojis: string[];
}

export interface User {
    _id?: string;
    name: string;
    profilePicture: string;
    email: string;
    password: string;
    themePreference: string;
}
export type SortOption =
    | 'name'
    | 'progress'
    | 'created'
    | 'lastEdited'
    | 'custom';

export type ThemeName = 'buji' | 'daigo' | 'enzu';

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
            themePreference?: string | null;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
    }
}
