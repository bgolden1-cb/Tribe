import { MongoClient, ObjectId, Int32 } from 'mongodb';

// Set Node.js TLS options
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
process.env.MONGODB_TLS_VERSION = "TLS1_2";

// Use direct connection string with all replica set members
const MONGODB_URI = "mongodb://tribe:tribe@ac-thnyg7t-shard-00-00.9dkrual.mongodb.net:27017,ac-thnyg7t-shard-00-01.9dkrual.mongodb.net:27017,ac-thnyg7t-shard-00-02.9dkrual.mongodb.net:27017/tribe?ssl=true&replicaSet=atlas-pb15q9-shard-0&authSource=admin";
const DB_NAME = "Tribe";

let client: MongoClient | null = null;

export async function connectToDatabase() {
  if (!client) {
    try {
      client = new MongoClient(MONGODB_URI, {
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        waitQueueTimeoutMS: 30000,
      });

      await client.connect();
      console.log('Connected to MongoDB');
      
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
      console.error('MongoDB connection error:', error);
      client = null;
      throw error;
    }
  }
  return client.db(DB_NAME);
}

export interface Benefit {
  _id?: ObjectId;  // MongoDB ObjectId type
  tribe: string;   // Contract address as string
  benefit_text: string;  // String type
  tier: Int32;     // MongoDB Int32 type
}

// Helper function to get all benefits for a tribe
export async function getBenefitsByTribeAndTiers(contractAddress: string, tierCounts: readonly bigint[]): Promise<{ [key: number]: string[] }> {
  try {
    const db = await connectToDatabase();
    
    // Initialize benefits object
    const benefitsByTier: { [key: number]: string[] } = {
      0: [], // Bronze
      1: [], // Silver
      2: []  // Gold
    };

    // Get tiers that have count >= 1
    const activeTiers = tierCounts.map((count, index) => ({ count, index }))
                                .filter(({ count }) => count >= 1n)
                                .map(({ index }) => index);

    console.log('Active tiers:', activeTiers);
    console.log('Looking for benefits with tribe:', contractAddress);

    if (activeTiers.length > 0) {
      console.log("activeTiers", activeTiers);
      console.log("activeTiers as Int32", activeTiers.map(t => new Int32(t)));
      const benefits = await db.collection<Benefit>('benefits')
        .find({
          tribe: contractAddress,
          tier: { $in: activeTiers.map(t => new Int32(t)) }  // Convert to Int32 for MongoDB
        })
        .toArray();

      console.log("Found benefits:", benefits);

      // Group benefits by tier
      benefits.forEach(benefit => {
        const tierNum = benefit.tier instanceof Int32 ? benefit.tier.valueOf() : Number(benefit.tier);
        if (activeTiers.includes(tierNum)) {
          benefitsByTier[tierNum].push(benefit.benefit_text);
        }
      });
    }

    return benefitsByTier;
  } catch (error) {
    console.error('Error fetching benefits:', error);
    throw error;
  }
}

// Helper function to insert a benefit
export async function insertBenefit(data: { 
  _id?: string | ObjectId,
  tribe: string,
  benefit_text: string,
  tier: number 
}) {
  const db = await connectToDatabase();
  
  // Convert string _id to ObjectId if provided
  const _id = typeof data._id === 'string' ? new ObjectId(data._id) : data._id;
  
  // Create the benefit document with Int32 tier
  const benefit: Benefit = {
    ..._id ? { _id } : {},
    tribe: data.tribe,
    benefit_text: data.benefit_text,
    tier: new Int32(data.tier)
  };
  
  const result = await db.collection<Benefit>('benefits').insertOne(benefit);
  return result;
}

// Helper function to get all benefits
export async function getAllBenefits() {
  const db = await connectToDatabase();
  return db.collection<Benefit>('benefits').find().toArray();
} 