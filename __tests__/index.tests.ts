import app from "../src"
import { drizzle } from "drizzle-orm/d1";
import { users } from "../src/db/schema";
import type { Env } from "../src/worker"; // Add this import


// Mock the environment bindings
const mockEnv = {
    DB: {
        prepare: jest.fn().mockReturnValue({
            all: jest.fn().mockResolvedValue([{ name: 'users' }]), // Mock the response for the DB query
        }),
    },
};
// Mock data for testing - make it let instead of const so it can be modified
let mockUsers = [
    { userID: 'user123', name: 'John Doe', email: 'john.doe@example.com' },
    { userID: 'user456', name: 'Jane Smith', email: 'jane.smith@example.com' },
    { userID: 'user789', name: 'Bob Wilson', email: 'bob.wilson@example.com' }
];

jest.mock("drizzle-orm/d1", () => ({
    drizzle: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
                all: jest.fn().mockImplementation(() => Promise.resolve(mockUsers)),
            }),
        }),
        insert: jest.fn().mockReturnValue({
            values: jest.fn().mockImplementation((data) => {
                mockUsers.push(data);
                return Promise.resolve({ success: true });
            })
        })
    })),
}));

describe('Get Users', () => {
    test('GET /getAllUser', async () => {
        const res = await app.request('/getAllUser', {}, mockEnv);
        const responseData = await res.json();

        expect(responseData).toEqual({
            success: true,
            result: expect.arrayContaining([
                expect.objectContaining({
                    userID: expect.any(String),
                    name: expect.any(String),
                    email: expect.any(String)
                })
            ])
        });
    });
});

describe('Example', () => {
    test('GET /posts', async () => {
        const res = await app.request('/posts')
        expect(res.status).toBe(200)
        expect(await res.text()).toBe('Many posts')
    })
})

test('POST /posts', async () => {
    const res = await app.request('/posts', {
        method: 'POST',
    })
    expect(res.status).toBe(201)
    expect(res.headers.get('X-Custom')).toBe('Thank you')
    expect(await res.json()).toEqual({
        message: 'Created',
    })
})

describe('User Management', () => {
    test('POST /addUser - successful creation', async () => {
        const userData = {
            userID: 'user123444',
            name: 'John Doeeeee',
            email: 'john.doewasdasd@example.com'
        };

        const res = await app.request('/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        }, mockEnv);

        const responseData = await res.json();
        expect(responseData).toEqual({
            success: true,
            message: 'User added successfully'
        });

        expect(mockUsers).toContainEqual(userData);
    });

    test('POST /addUser - validation error', async () => {
        const invalidUserData = {
            userID: 'usr',
            name: 'John',
            email: 'invalid-email'
        };

        const res = await app.request('/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invalidUserData)
        }, mockEnv);

        expect(res.status).toBe(400);
        const responseData = await res.json();
        expect(responseData).toHaveProperty('success', false);
    });

    test('GET /getAllUser after insert', async () => {
        const res = await app.request('/getAllUser', {}, mockEnv);
        const responseData = await res.json();

        expect(responseData).toEqual({
            success: true,
            result: expect.arrayContaining([
                ...mockUsers.map(user => expect.objectContaining(user))
            ])
        });
        
        expect((responseData as { success: boolean, result: unknown[] }).result.length).toBe(mockUsers.length);
    });
});

describe('Get All duplicate', () => {
    test('GET /getAllUser', async () => {
        const res = await app.request('/getAllUser', {}, mockEnv);
        const responseData = await res.json();

        expect(responseData).toEqual({
            success: true,
            result: expect.arrayContaining([
                expect.objectContaining({
                    userID: expect.any(String),
                    name: expect.any(String),
                    email: expect.any(String)
                })
            ])
        });
    });
});
