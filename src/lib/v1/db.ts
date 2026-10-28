import { MongoClient, ObjectId, type Db } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.DB_NAME ?? "kenlivo";

// Reuse connection across hot reloads in development.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

export async function getDb(): Promise<Db> {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
    await global._mongoClient.connect();
  }
  return global._mongoClient.db(dbName);
}

export { ObjectId };

export function toId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export function paginate(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return { skip, limit };
}
