import { connectToDatabase, insertBenefit } from './utils/db';

async function testConnection() {
  try {
    const db = await connectToDatabase();
    console.log('Successfully connected to database');

    // Try to insert a test benefit
    const testBenefit = {
      tribe: "0xe6308BCDcee3A05aA10031a0f3d112F8Aa77e311",
      benefit_text: "Test Benefit",
      tier: 0
    };

    const result = await insertBenefit(testBenefit);
    console.log('Successfully inserted test benefit:', result);

    process.exit(0);
  } catch (error) {
    console.error('Database test failed:', error);
    process.exit(1);
  }
}

testConnection(); 