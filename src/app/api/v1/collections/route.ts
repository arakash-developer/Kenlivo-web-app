import { NextRequest } from "next/server";
import { getDb, paginate } from "@/lib/v1/db";
import { ok } from "@/lib/v1/response";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 100)));
  const search = searchParams.get("search") ?? "";
  const filter: Record<string, unknown> = { isActive: true };

  if (search) filter.name = { $regex: search, $options: "i" };

  const collection = (await getDb()).collection("collections");
  const { skip } = paginate(page, limit);
  const [documents, total] = await Promise.all([
    collection.find(filter).sort({ name: 1 }).skip(skip).limit(limit).toArray(),
    collection.countDocuments(filter),
  ]);
  const items = documents.map((document) => ({
    ...document,
    _id: document._id.toString(),
  }));

  return ok(items, "OK", {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
