import { NextRequest } from "next/server";
import { getDb, paginate } from "@/lib/v1/db";
import { requireAdmin, ok, created, err } from "@/lib/v1/response";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.min(200, Math.max(1, Number(sp.get("limit") ?? 100)));
  const search = sp.get("search") ?? "";

  const filter: Record<string, unknown> = {};
  if (search) filter.name = { $regex: search, $options: "i" };

  const db = await getDb();
  const col = db.collection("categories");
  const { skip } = paginate(page, limit);

  const [rawItems, total] = await Promise.all([
    col.find(filter).sort({ name: 1 }).skip(skip).limit(limit).toArray(),
    col.countDocuments(filter),
  ]);

  const items = rawItems.map((c) => ({ ...c, _id: c._id.toString() }));

  return ok(items, "OK", {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: Request) {
  const result = await requireAdmin(req);
  if ("cookies" in result) return result;

  const body = await req.json().catch(() => null);
  if (!body) return err("Invalid JSON");

  const { name, description, image, isActive = true } = body;
  if (!name) return err("name is required");

  const db = await getDb();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const now = new Date();

  const { insertedId } = await db.collection("categories").insertOne({
    name,
    slug,
    description: description ?? null,
    image: image ?? null,
    isActive,
    createdAt: now,
    updatedAt: now,
  });

  return created({ _id: insertedId.toString() }, "Category created");
}
