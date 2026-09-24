import { MongoClient, Db } from 'mongodb';

function getUri(): string {
  return process.env.MONGODB_URI || '';
}

function getDbName(): string {
  return process.env.MONGODB_DB || 'aimprimir3d';
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoDBConfigured(): boolean {
  const uri = getUri();
  return Boolean(uri && uri.startsWith('mongodb'));
}

export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = getUri();
  if (!uri || !uri.startsWith('mongodb')) {
    return null;
  }

  try {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
    return await clientPromise;
  } catch (error) {
    console.error('Error al conectar con MongoDB Atlas:', error);
    // Reset promise so next request can retry connection
    global._mongoClientPromise = undefined;
    return null;
  }
}

export async function getDatabase(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(getDbName());
}
