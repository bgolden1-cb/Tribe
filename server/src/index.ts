import express from 'express';
import cors from 'cors';
import { getMemberTiers } from './utils/contracts';
import { connectToDatabase, getBenefitsByTribeAndTiers, insertBenefit } from './utils/db';

const app = express();
const port = 4000;
const db = connectToDatabase();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', '*', 'https://base-tribe.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'We up up!' });
});

// API endpoint to insert a benefit

// API endpoint to get benefits based on user's tiers for a specific NFT contract
app.get('/api/benefits', async (req, res) => {
  try {
    const { contract: contractAddress, address: userAddress } = req.query;

    if (!contractAddress || !userAddress) {
      return res.status(400).json({ 
        error: 'Both contract address and user address are required',
        example: '/api/benefits?contract=0x...&address=0x...'
      });
    }

    // Get user's tiers from the contract - returns [bronze_count, silver_count, gold_count]
    const memberTiers = await getMemberTiers(contractAddress as string, userAddress as string);
    console.log('Member tier counts:', memberTiers);

    // Get benefits based on tier counts
    const benefits = await getBenefitsByTribeAndTiers(contractAddress as string, memberTiers);

    // Convert BigInt values to strings for JSON response
    const tierCountsAsStrings = memberTiers.map(count => count.toString());

    return res.json({
      tribe: {
        address: contractAddress,
      },
      tierCounts: tierCountsAsStrings,
      benefits
    });
  } catch (error) {
    console.error('Error fetching benefits:', error);
    return res.status(500).json({ error: 'Failed to fetch benefits' });
  }
});

// API endpoint to insert a benefit for multiple tiers
app.post('/api/benefit/multi', async (req, res) => {
  try {
    const { tribe, benefit_text, tiers } = req.body;

    // Validate inputs
    if (!tribe || !benefit_text || !Array.isArray(tiers) || tiers.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: {
          tribe: 'Contract address (string)',
          benefit_text: 'Benefit description (string)',
          tiers: 'Array of tier numbers (e.g. [0, 1, 2])'
        },
        example: {
          "tribe": "0xe6308BCDcee3A05aA10031a0f3d112F8Aa77e311",
          "benefit_text": "THIS IS MY BLOG VIEWED BY GOLD",
          "tiers": [0, 2]
        }
      });
    }

    // Validate each tier value
    for (const t of tiers) {
      if (![0, 1, 2].includes(Number(t))) {
        return res.status(400).json({
          error: 'Invalid tier value',
          message: 'Each tier must be 0 (Bronze), 1 (Silver), or 2 (Gold)'
        });
      }
    }

    // Insert a benefit for each tier
    const results = [];
    for (const t of tiers) {
      const result = await insertBenefit({
        tribe,
        benefit_text,
        tier: Number(t)
      });
      results.push({ tier: Number(t), insertedId: result.insertedId });
    }

    return res.json({
      success: true,
      message: 'Benefits added for all specified tiers',
      results
    });
  } catch (error) {
    console.error('Error inserting multi-tier benefit:', error);
    return res.status(500).json({ error: 'Failed to insert benefits' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});