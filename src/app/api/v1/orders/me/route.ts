import { NextRequest } from "next/server";
import { getDb, paginate } from "@/lib/v1/db";
import { requireAuth, ok } from "@/lib/v1/response";

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if ("cookies" in result) return result;

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(sp.get("limit") ?? 10)));
  const sortParam = sp.get("sort") ?? "-createdAt";
  const sortField = sortParam.startsWith("-") ? sortParam.slice(1) : sortParam;
  const sortDir = sortParam.startsWith("-") ? -1 : 1;

  const filter: Record<string, unknown> = { user: result.user.sub };
  const status = sp.get("status");
  if (status) filter.status = status;

  const db = await getDb();
  const col = db.collection("orders");
  const { skip } = paginate(page, limit);

  const [items, total] = await Promise.all([
    col.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limit).toArray(),
    col.countDocuments(filter),
  ]);

  const mapped = items.map((o) => ({ ...o, _id: o._id.toString() }));
  return ok(mapped, "OK", { page, limit, total, totalPages: Math.ceil(total / limit) });
}
