import { initDb } from './db'

let initialization: Promise<void> | null = null

export function ensureDb() {
  if (!initialization) {
    initialization = initDb().catch((error) => {
      initialization = null
      throw error
    })
  }
  return initialization
}
