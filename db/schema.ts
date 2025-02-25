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
  userId: uuid('user_id').notNull(),
  baseProfileId: integer('base_profile_id')
    .references(() => financialProfiles.id)
    .notNull(),
  currentIncome: numeric('current_income', { precision: 10, scale: 2 }).notNull(),
  currentDebt: numeric('current_debt', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Account Types Enumeration
export const accountTypes = ['checking', 'savings'] as const;
export type AccountType = (typeof accountTypes)[number];

// Accounts Table
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userFinancialProfileId: uuid('user_financial_profile_id')
    .references(() => userFinancialProfiles.id)
    .notNull(),
  accountType: varchar('account_type', { length: 20 }).$type<AccountType>().notNull(),
  balance: numeric('balance', { precision: 12, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});
