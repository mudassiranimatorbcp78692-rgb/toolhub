import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

let db: ReturnType<typeof drizzle> | null = null;

export async function initializeDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, reviews will not persist');
    return null;
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
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
