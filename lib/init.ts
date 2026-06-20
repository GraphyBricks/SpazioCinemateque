import { initDb } from './db'
import { seed } from './seed'

let initialized = false

export function ensureDb() {
  if (initialized) return
  initDb()
  seed()
  initialized = true
}
