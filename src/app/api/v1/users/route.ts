import { NextRequest } from "next/server";
import { getDb, paginate } from "@/lib/v1/db";
import { requireAdmin, ok } from "@/lib/v1/response";

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req);
  if ("cookies" in result) return result;

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 20)));
  const search = sp.get("search") ?? "";
  const role = sp.get("role") ?? "";
  const sortParam = sp.get("sort") ?? "-createdAt";
  const sortField = sortParam.startsWith("-") ? sortParam.slice(1) : sortParam;
  const sortDir = sortParam.startsWith("-") ? -1 : 1;

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role) filter.role = role;

  const db = await getDb();
  const col = db.collection("customers");
  const { skip } = paginate(page, limit);

  const [rawItems, total] = await Promise.all([
    col.find(filter, { projection: { passwordHash: 0 } })
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .toArray(),
    col.countDocuments(filter),
  ]);

  const items = rawItems.map((u) => ({ ...u, _id: u._id.toString() }));
  return ok(items, "OK", { page, limit, total, totalPages: Math.ceil(total / limit) });
}
