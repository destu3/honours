import { logger } from '../logger.config.ts';
import supabase from './client.ts';

async function seedFinancialProfiles() {
  // Check if any record exists in the financial_profiles table
  const { data: existingProfiles, error: selectError } = await supabase.from('financial_profiles').select('id').limit(1);

  if (selectError) {
    logger.error('Error checking financial_profiles:', { error: selectError });
    return;
  }

  if (existingProfiles && existingProfiles.length > 0) {
    logger.info('financial_profiles table already seeded.');
    return;
  }

  // Define the seed data for different undergrad types
  const seedData = [
    {
      profile_name: 'Budget-Conscious Undergrad',
      description: 'A student with minimal income relying on scholarships and family support. Focuses on strict budgeting.',
      starting_income: 500.0,
      starting_expenses: 600.0,
      starting_debt: 0.0,
      goals: 'Learn budgeting, reduce unnecessary expenses, and build credit over time.',
    },
    {
      profile_name: 'Part-Time Working Undergrad',
      description:
        'A student juggling part-time work and studies, with a moderate income. Balances work and academic commitments.',
      starting_income: 1000.0,
      starting_expenses: 800.0,
      starting_debt: 100.0,
      goals: 'Manage work-study balance, build savings, and develop a healthy financial profile.',
    },
    {
      profile_name: 'Scholarship/Grant-Funded Undergrad',
      description: 'A student primarily funded through scholarships or grants, with a stable but limited income source.',
      starting_income: 1200.0,
      starting_expenses: 1100.0,
      starting_debt: 0.0,
      goals: 'Maximize scholarship funds, minimize debt, and plan for future expenses.',
    },
    {
      profile_name: 'Financially Independent Undergrad',
      description:
        'A student who self-funds through full-time work or entrepreneurship, balancing higher expenses with greater income.',
      starting_income: 1500.0,
      starting_expenses: 1300.0,
      starting_debt: 200.0,
      goals: 'Achieve financial independence, manage higher cash flow, and build credit responsibly.',
    },
  ];

  // Insert the seed data
  logger.info('Inserting seed data for financial_profiles...');
  const { error: insertError } = await supabase.from('financial_profiles').insert(seedData);

  if (insertError) {
    logger.error('Error seeding financial_profiles:', { error: insertError });
  } else {
    logger.info('Seed data inserted for financial_profiles.');
  }
}

seedFinancialProfiles();
