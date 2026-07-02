import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { or, eq } from "drizzle-orm";

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const sql = neon(url);
  const db = drizzle(sql, { schema });

  try {
    const result = await db
      .update(schema.users)
      .set({ role: "admin" })
      .where(
        or(
          eq(schema.users.email, "kaushalkantmishra127@gmail.com"),
          eq(schema.users.email, "kaushalknatmishra127@gmail.com")
        )
      )
      .returning();

    console.log("Updated users to admin:", JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(error);
  }
}

run();
