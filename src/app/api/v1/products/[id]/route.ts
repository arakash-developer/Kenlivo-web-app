import { getDb, toId } from "@/lib/v1/db";
import { requireAdmin, ok, err, notFound } from "@/lib/v1/response";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const oid = toId(id);
  if (!oid) return err("Invalid id");

  const db = await getDb();
  const [product] = await db.collection("products").aggregate([
    { $match: { _id: oid } },
    { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    { $addFields: { _id: { $toString: "$_id" }, "category._id": { $toString: "$category._id" } } },
  ]).toArray();

  if (!product) return notFound("Product not found");
  return ok(product);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const result = await requireAdmin(req);
  if ("cookies" in result) return result;

  const { id } = await params;
  const oid = toId(id);
  if (!oid) return err("Invalid id");

  const body = await req.json().catch(() => ({}));
  const allowed = ["name", "description", "tagline", "price", "discountPercentage", "category", "images", "stock", "isActive"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { updatedAt: new Date() };

  for (const key of allowed) {
    if (key in body) {
      if (key === "category") {
        const cid = toId(body[key]);
        if (!cid) return err("Invalid category id");
        update[key] = cid;
      } else {
        update[key] = body[key];
      }
    }
  }

  if ("price" in update || "discountPercentage" in update) {
    const db = await getDb();
    const existing = await db.collection("products").findOne({ _id: oid });
    const price = update.price ?? existing?.price ?? 0;
    const disc = update.discountPercentage ?? existing?.discountPercentage ?? 0;
    update.finalPrice = Number((price * (1 - disc / 100)).toFixed(2));
  }

  const db = await getDb();
  const { matchedCount } = await db.collection("products").updateOne({ _id: oid }, { $set: update });
  if (!matchedCount) return notFound("Product not found");

  return ok(null, "Product updated");
}

export async function DELETE(req: Request, { params }: Ctx) {
  const result = await requireAdmin(req);
  if ("cookies" in result) return result;

  const { id } = await params;
  const oid = toId(id);
  if (!oid) return err("Invalid id");

  const db = await getDb();
  const { deletedCount } = await db.collection("products").deleteOne({ _id: oid });
  if (!deletedCount) return notFound("Product not found");

  return ok(null, "Product deleted");
}
