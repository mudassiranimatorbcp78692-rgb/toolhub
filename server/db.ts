import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

let db: ReturnType<typeof drizzle> | null = null;
let client: postgres.Sql | null = null;

export async function initializeDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, reviews will not persist');
    return null;
  }

  try {
    client = postgres(process.env.DATABASE_URL);
    db = drizzle(client, { schema });
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return null;
  }
}

export function getDb() {
  return db;
}
