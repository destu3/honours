import { pgTable, serial, varchar, text, numeric, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

// Base Financial Profiles (Templates for users to choose from)
export const financialProfiles = pgTable('financial_profiles', {
  id: serial('id').primaryKey(),
  profileName: varchar('profile_name', { length: 100 }).notNull(),
  description: text('description'),
  startingIncome: numeric('starting_income', { precision: 10, scale: 2 }).default('0.00').notNull(),
  startingExpenses: numeric('starting_expenses', { precision: 10, scale: 2 }).default('0.00').notNull(),
  startingDebt: numeric('starting_debt', { precision: 10, scale: 2 }).default('0.00').notNull(),
  goals: text('goals'),
});

// User Financial Profiles (data associated with each user)
export const userFinancialProfiles = pgTable('user_financial_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Supabase manages users with UUIDs, so we use a uuid type here.
  userId: uuid('user_id').notNull(),
  // Reference to the chosen base profile
  baseProfileId: integer('base_profile_id')
    .references(() => financialProfiles.id)
    .notNull(),
  // Current financial state (populated from the base template at creation)
  currentIncome: numeric('current_income', { precision: 10, scale: 2 }).notNull(),
  currentExpenses: numeric('current_expenses', { precision: 10, scale: 2 }).notNull(),
  currentDebt: numeric('current_debt', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});
