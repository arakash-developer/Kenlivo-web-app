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
  const allowed = ["name", "email", "phone", "isActive", "role"];
  const update: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const db = await getDb();
  const { matchedCount } = await db.collection("customers").updateOne({ _id: oid }, { $set: update });
  if (!matchedCount) return notFound("User not found");

  return ok(null, "User updated");
}

export async function DELETE(req: Request, { params }: Ctx) {
  const result = await requireAdmin(req);
  if ("cookies" in result) return result;

  const { id } = await params;
  const oid = toId(id);
  if (!oid) return err("Invalid id");

  const db = await getDb();
  const { deletedCount } = await db.collection("customers").deleteOne({ _id: oid });
  if (!deletedCount) return notFound("User not found");

  return ok(null, "User deleted");
}
