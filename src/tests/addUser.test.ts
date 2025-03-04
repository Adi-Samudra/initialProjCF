import { describe, it, expect } from 'vitest';
import app from '../index';

describe('addUser API Tests', () => {
  const MOCK_DB = {
    DB: {
      prepare: () => ({
        all: () => Promise.resolve([]),
      }),
      insert: () => Promise.resolve({ success: true }),
    },
    apitoken: 'mock-token'
  };

  it('should successfully create a new user with valid data', async () => {
    const testUser = {
      userID: 'test123',
      name: 'Test User',
      email: 'test@example.com'
    };

    const res = await app.request('/addUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    }, MOCK_DB);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      success: true,
      message: 'User added successfully'
    });
  });

  it('should fail with invalid email format', async () => {
    const invalidUser = {
      userID: 'test123',
      name: 'Test User',
      email: 'invalid-email'
    };

    const res = await app.request('/addUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidUser)
    }, MOCK_DB);

    expect(res.status).toBe(400);
  });

  it('should fail with missing required fields', async () => {
    const incompleteUser = {
      userID: 'test123'
    };

    const res = await app.request('/addUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(incompleteUser)
    }, MOCK_DB);

    expect(res.status).toBe(400);
  });

  it('should handle database error gracefully', async () => {
    const MOCK_DB_ERROR = {
      DB: {
        prepare: () => ({
          all: () => Promise.resolve([]),
        }),
        insert: () => Promise.reject('Database error'),
      },
      apitoken: 'mock-token'
    };

    const testUser = {
      userID: 'test123',
      name: 'Test User',
      email: 'test@example.com'
    };

    const res = await app.request('/addUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    }, MOCK_DB_ERROR);

    const data = await res.json() as { success: boolean; message: string };
    expect(data.success).toBe(false);
    expect(data.message).toBeDefined();
  });
});