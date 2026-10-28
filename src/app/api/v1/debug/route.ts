import { getDb } from "@/lib/v1/db";

// Temporary debug endpoint — remove in production.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not available" }, { status: 404 });
  }
  const db = await getDb();
  const collections = await db.listCollections().toArray();
  const names = collections.map((c) => c.name);

  const counts: Record<string, number> = {};
  for (const name of names) {
    counts[name] = await db.collection(name).countDocuments();
  }

  return Response.json({ collections: names, counts });
}
