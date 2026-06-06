import { Pool } from "pg";

const g = global as unknown as { _pool: Pool };

const pool =
  g._pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

if (process.env.NODE_ENV !== "production") g._pool = pool;

export default pool;
