import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not defined in process env");
    return;
  }
  const sql = neon(url);
  const db = drizzle(sql, { schema });

  try {
    const list = await db.select().from(schema.chatRooms);
    console.log("Chat Rooms:", JSON.stringify(list, null, 2));

    const parts = await db
      .select({
        id: schema.chatParticipants.id,
        roomId: schema.chatParticipants.roomId,
        userId: schema.chatParticipants.userId,
        userName: schema.users.name,
        userImage: schema.users.image,
      })
      .from(schema.chatParticipants)
      .leftJoin(schema.users, eq(schema.chatParticipants.userId, schema.users.id));
    console.log("Participants Joined with Users:", JSON.stringify(parts, null, 2));
  } catch (error: any) {
    console.error("Query failed. Error details:", error);
  }
}

run();
