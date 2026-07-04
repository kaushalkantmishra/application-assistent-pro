import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables")
}

const connectionString = process.env.DATABASE_URL.replace(/^['"]|['"]$/g, "")
const sql = neon(connectionString)
export const db = drizzle(sql, { schema })
