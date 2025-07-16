import { MongoClient } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(process.env.MONGODB_URI || "");

let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
} else {
  clientPromise = global._mongoClientPromise;
}

// API 라우트에서 직접 MongoDB와 상호작용할 수 있도록 Promise<MongoClient>를 export
export default clientPromise; 