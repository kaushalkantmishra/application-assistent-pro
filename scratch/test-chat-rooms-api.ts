import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const sql = neon(url);
  const db = drizzle(sql, { schema });

  const userId = "2e39fb67-1cf3-40e9-8bc8-b250cfa1e8f3"; // Kaushal Kant Mishra

  try {
    const userParticipants = await db
      .select()
      .from(schema.chatParticipants)
      .where(eq(schema.chatParticipants.userId, userId));

    const roomIds = userParticipants.map((p) => p.roomId);
    console.log("Room IDs:", roomIds);

    const allParticipants = await db
      .select({
        roomId: schema.chatParticipants.roomId,
        userId: schema.chatParticipants.userId,
        name: schema.users.name,
        image: schema.users.image,
      })
      .from(schema.chatParticipants)
      .leftJoin(schema.users, eq(schema.chatParticipants.userId, schema.users.id))
      .where(inArray(schema.chatParticipants.roomId, roomIds));

    console.log("All Participants in Rooms:", JSON.stringify(allParticipants, null, 2));

    const grouped: Record<string, any[]> = {};
    allParticipants.forEach((p) => {
      if (!grouped[p.roomId]) grouped[p.roomId] = [];
      grouped[p.roomId].push({
        userId: p.userId,
        name: p.name || "User",
        image: p.image || null,
      });
    });

    const roomsList = Object.keys(grouped).map((roomId) => {
      const other = grouped[roomId].find((u) => u.userId !== userId) || { name: "Chat Partner", userId: "", image: null };
      return {
        id: roomId,
        partner: other,
        participants: grouped[roomId],
      };
    });

    console.log("Final roomsList:", JSON.stringify(roomsList, null, 2));
  } catch (e: any) {
    console.error(e);
  }
}

run();
