import { MongoClient, Db } from 'mongodb';

const DEFAULT_ATLAS_URI =
  'mongodb+srv://portaforza_db_user:uSF25ipWXsKQ3DAy@cluster0.2vqqcae.mongodb.net/aimprimir3d?retryWrites=true&w=majority&appName=Cluster0';

function getUri(): string {
  const raw = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;
  return raw.trim().replace(/^["']|["']$/g, '').trim() || DEFAULT_ATLAS_URI;
}

function getDbName(): string {
  const raw = process.env.MONGODB_DB || 'aimprimir3d';
  return raw.trim().replace(/^["']|["']$/g, '').trim() || 'aimprimir3d';
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientInstance: MongoClient | undefined;
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
    if (!global._mongoClientInstance) {
      const client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      await client.connect();
      global._mongoClientInstance = client;
    }
    return global._mongoClientInstance;
  } catch (error) {
    console.error('Error al conectar con MongoDB Atlas:', error);
    global._mongoClientInstance = undefined;
    return null;
  }
}

export async function getDatabase(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(getDbName());
}
