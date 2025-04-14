import { pgTable, serial, varchar, text, numeric, timestamp, uuid, integer, boolean } from 'drizzle-orm/pg-core';

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
  needsBudget: numeric('needs_budget', { precision: 10, scale: 2 }).default('0.00').notNull(),
  wantsBudget: numeric('wants_budget', { precision: 10, scale: 2 }).default('0.00').notNull(),
  savingsBudget: numeric('savings_budget', { precision: 10, scale: 2 }).default('0.00').notNull(),
  accountLevel: integer('account_level').default(1).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// Account Types Enumeration
const accountTypes = ['checking', 'savings'] as const;
type AccountType = (typeof accountTypes)[number];

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

const transactionCategories = ['needs', 'wants', 'savings'] as const;
type TransactionCategory = (typeof transactionCategories)[number];

// Transactions Table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id')
    .references(() => accounts.id)
    .notNull(),
  category: varchar('category', { length: 20 }).$type<TransactionCategory>().notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
});

// Goal Types Enumeration
const goalTypes = ['savings_target', 'spending_limit', 'debt_reduction'] as const;
type GoalType = (typeof goalTypes)[number];

// Financial Goals Table
export const financialGoals = pgTable('financial_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userFinancialProfileId: uuid('user_financial_profile_id')
    .references(() => userFinancialProfiles.id)
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).$type<GoalType>().notNull(),
  targetAmount: numeric('target_amount', { precision: 12, scale: 2 }).notNull(),
  currentProgress: numeric('current_progress', { precision: 12, scale: 2 }).default('0.00').notNull(),
  dueDate: timestamp('due_date', { mode: 'string' }),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});
