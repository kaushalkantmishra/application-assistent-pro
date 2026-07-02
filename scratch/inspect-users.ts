import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { ilike } from "drizzle-orm";

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const sql = neon(url);
  const db = drizzle(sql, { schema });

  try {
    const list = await db.select().from(schema.users).where(ilike(schema.users.email, "%kaushal%"));
    console.log("Users in db matching kaushal:", JSON.stringify(list, null, 2));
  } catch (error: any) {
    console.error(error);
  }
}

run();
