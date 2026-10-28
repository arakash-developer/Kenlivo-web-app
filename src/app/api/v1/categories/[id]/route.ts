import { getDb, toId } from "@/lib/v1/db";
import { requireAdmin, ok, err, notFound } from "@/lib/v1/response";

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  const result = await requireAdmin(req);
  if ("cookies" in result) return result;

  const { id } = await params;
  const oid = toId(id);
  if (!oid) return err("Invalid id");

  const body = await req.json().catch(() => ({}));
  const allowed = ["name", "description", "image", "isActive"];
  const update: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }
  if ("name" in body) {
    update.slug = (body.name as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  const db = await getDb();
  const { matchedCount } = await db.collection("categories").updateOne({ _id: oid }, { $set: update });
  if (!matchedCount) return notFound("Category not found");

  return ok(null, "Category updated");
}

export async function DELETE(req: Request, { params }: Ctx) {
  const result = await requireAdmin(req);
  if ("cookies" in result) return result;

  const { id } = await params;
  const oid = toId(id);
  if (!oid) return err("Invalid id");

  const db = await getDb();
  const { deletedCount } = await db.collection("categories").deleteOne({ _id: oid });
  if (!deletedCount) return notFound("Category not found");

  return ok(null, "Category deleted");
}
