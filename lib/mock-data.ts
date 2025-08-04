// Temporary mock data for testing when MongoDB is not available
export const mockUsers = [
  {
    _id: "mock-id-1",
    email: "admin@test.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1qCWqAZT4u", // password123
    name: "Admin User",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "mock-id-2",
    email: "test@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1qCWqAZT4u", // password123
    name: "Test User",
    role: "kasir",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "mock-id-3",
    email: "demo@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj1qCWqAZT4u", // password123
    name: "Demo User",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function findMockUser(email: string) {
  return mockUsers.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );
}
