const categories = ['needs', 'wants', 'savings'];
export interface Transaction {
  account_id: string;
  amount: string;
  category: string;
  description: string;
  created_at: string;
}

const categoryDescriptions: Record<string, string[]> = {
  needs: ['Grocery shopping', 'Utility bill payment', 'Public transport fare', 'Medical expenses', 'Rent payment', 'Car fuel'],
  wants: [
    'Dining out',
    'Streaming service subscription',
    'Gym membership',
    'Clothing purchase',
    'Electronics purchase',
    'Concert tickets',
    'Gaming subscription',
  ],
  savings: [
    'Investment deposit',
    'Emergency fund contribution',
    'Retirement savings',
    'Stock market investment',
    'Crypto investment',
    'High-yield savings deposit',
  ],
};

export function generateFakeTransactions(accountId: string) {
  const transactions: Transaction[] = [];

  for (let i = 0; i < 3; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const description = categoryDescriptions[category][Math.floor(Math.random() * categoryDescriptions[category].length)];

    transactions.push({
      account_id: accountId,
      amount: (Math.random() * 50 + 5).toFixed(2), // Keeps amounts between 5 and 55
      category,
      description,
      created_at: new Date().toISOString(),
    });
  }

  return transactions;
}
