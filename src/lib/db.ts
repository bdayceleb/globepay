import fs from 'fs';
import path from 'path';

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    isKycComplete: boolean;
    kycDetails?: {
        aadharCard: string;
        panCard: string;
        fullName: string;
    };
}

const dbPath = path.join(process.cwd(), 'local-auth-db.json');

// Initialize the DB file if it doesn't exist
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [] }, null, 2));
}

export const db = {
    getUsers: (): User[] => {
        try {
            const data = fs.readFileSync(dbPath, 'utf8');
            return JSON.parse(data).users;
        } catch (error) {
            console.error('Failed to read DB:', error);
            return [];
        }
    },

    saveUsers: (users: User[]) => {
        try {
            fs.writeFileSync(dbPath, JSON.stringify({ users }, null, 2));
        } catch (error) {
            console.error('Failed to write DB:', error);
        }
    },

    findUserByEmail: (email: string): User | undefined => {
        return db.getUsers().find((u) => u.email === email);
    },

    findUserById: (id: string): User | undefined => {
        return db.getUsers().find((u) => u.id === id);
    },

    addUser: (user: User) => {
        const users = db.getUsers();
        users.push(user);
        db.saveUsers(users);
    },

    updateUser: (id: string, updates: Partial<User>) => {
        const users = db.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            db.saveUsers(users);
        }
    }
};
