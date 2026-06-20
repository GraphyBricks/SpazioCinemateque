import { Pool, type PoolClient, type QueryResultRow } from 'pg'

const connectionString = process.env.DATABASE_URL?.replace('sslmode=require', 'sslmode=verify-full')

if (!connectionString) {
  throw new Error('DATABASE_URL is required')
}

declare global {
  // eslint-disable-next-line no-var
  var spazioPostgresPool: Pool | undefined
}

const db = global.spazioPostgresPool ?? new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

if (process.env.NODE_ENV !== 'production') {
  global.spazioPostgresPool = db
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []): Promise<T[]> {
  const result = await db.query<T>(text, values)
  return result.rows
}

export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function initDb() {
  await db.query('SELECT 1')
}

export default db
