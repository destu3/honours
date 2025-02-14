import { pgTable, text, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(), // UUID primary key
  email: varchar('email', { length: 255 }).notNull().unique(), // Unique email
  password: text('password'), // Nullable password
  name: varchar('name', { length: 255 }).notNull(), // Full name
  createdAt: timestamp('created_at').defaultNow().notNull(), // Default creation timestamp
  updatedAt: timestamp('updated_at').defaultNow().notNull(), // Auto-updated timestamp
});
