import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'aimprimir3d';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoDBConfigured(): boolean {
  return Boolean(uri && uri.startsWith('mongodb'));
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoDBConfigured()) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!clientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000,
      });
      clientPromise = client.connect();
    }
  }

  try {
    return await clientPromise;
  } catch (error) {
    console.error('Error al conectar con MongoDB Atlas:', error);
    return null;
  }
}

export async function getDatabase(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(dbName);
}
