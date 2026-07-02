import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not defined in process env");
    return;
  }
  const sql = neon(url);
  const db = drizzle(sql, { schema });

  try {
    const list = await db.select().from(schema.users);
    console.log("Success! Users table has", list.length, "rows.");
    console.log("Rows:", JSON.stringify(list.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, image: u.image })), null, 2));
  } catch (error: any) {
    console.error("Query failed. Error details:", error);
  }
}

run();
