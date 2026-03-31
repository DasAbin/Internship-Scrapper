import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Required for local Node.js environment
// In Netlify edge functions this is not needed
if (process.env.NODE_ENV === 'development') {
  neonConfig.webSocketConstructor = ws;
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });