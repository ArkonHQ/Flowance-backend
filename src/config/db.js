import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config()

export * from '../db/relations.js'
export * from '../db/tables'


const sql = neon(process.env.DATABASE_URL)
export const db = drizzle(sql)
