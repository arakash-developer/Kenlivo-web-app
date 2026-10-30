import { NextRequest } from "next/server";
import { getDb, toId, paginate } from "@/lib/v1/db";
import { requireAdmin, ok, created, err } from "@/lib/v1/response";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 20)));
  const search = sp.get("search") ?? "";
  const categoryId = sp.get("category") ?? "";
  const collectionId = sp.get("collection") ?? "";
  const sortParam = sp.get("sort") ?? "-createdAt";

  const filter: Record<string, unknown> = { isActive: true };
  if (search) filter.name = { $regex: search, $options: "i" };
  if (categoryId) {
    const cid = toId(categoryId);
    if (cid) filter.category = cid;
  }
  if (collectionId) {
    const collectionObjectId = toId(collectionId);
    if (!collectionObjectId) return err("Invalid collection id");
    filter.collection = collectionObjectId;
  }

  const sortField = sortParam.startsWith("-") ? sortParam.slice(1) : sortParam;
  const sortDir = sortParam.startsWith("-") ? -1 : 1;

  const db = await getDb();
  const col = db.collection("products");
  const { skip } = paginate(page, limit);

  const [items, total] = await Promise.all([
    col
      .aggregate([
        { $match: filter },
        { $sort: { [sortField]: sortDir } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $lookup: {
            from: "collections",
            localField: "collection",
            foreignField: "_id",
            as: "collection",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$collection", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            _id: { $toString: "$_id" },
            "category._id": { $toString: "$category._id" },
            "collection._id": { $toString: "$collection._id" },
          },
        },
      ])
      .toArray(),
    col.countDocuments(filter),
  ]);

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

  const { name, description, tagline, price, discountPercentage = 0, category, collection, images = [], stock = 0, isActive = true } = body;
  if (!name || !description || price == null || !category || !collection) {
    return err("name, description, price, category and collection are required");
  }

  const cid = toId(category);
  if (!cid) return err("Invalid category id");
  const collectionId = toId(collection);
  if (!collectionId) return err("Invalid collection id");

  const db = await getDb();
  const catExists = await db.collection("categories").findOne({ _id: cid });
  if (!catExists) return err("Category not found", 404);
  const collectionExists = await db.collection("collections").findOne({ _id: collectionId });
  if (!collectionExists) return err("Collection not found", 404);

  const finalPrice = Number((price * (1 - discountPercentage / 100)).toFixed(2));
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const now = new Date();

  const { insertedId } = await db.collection("products").insertOne({
    name,
    slug,
    description,
    tagline: tagline ?? null,
    price: Number(price),
    discountPercentage: Number(discountPercentage),
    finalPrice,
    category: cid,
    collection: collectionId,
    images,
    stock: Number(stock),
    rating: 0,
    numReviews: 0,
    isActive,
    createdAt: now,
    updatedAt: now,
  });

  return created({ _id: insertedId.toString() }, "Product created");
}
