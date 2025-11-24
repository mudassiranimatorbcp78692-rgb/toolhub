import { drizzle } from 'drizzle-orm/neon-http';
import { Client } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

let db: ReturnType<typeof drizzle> | null = null;

export async function initializeDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, reviews will not persist');
    return null;
  }

  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
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
