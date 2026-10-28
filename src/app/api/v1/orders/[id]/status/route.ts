import { getDb, toId } from "@/lib/v1/db";
import { requireAdmin, ok, err, notFound } from "@/lib/v1/response";

const VALID_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  const result = await requireAdmin(req);
  if ("cookies" in result) return result;

  const { id } = await params;
  const oid = toId(id);
  if (!oid) return err("Invalid id");

  const body = await req.json().catch(() => ({}));
  const { status } = body as { status?: string };
  if (!status || !VALID_STATUSES.includes(status)) {
    return err(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const db = await getDb();
  const update: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status === "paid") { update.isPaid = true; update.paidAt = new Date(); }

  const { matchedCount } = await db.collection("orders").updateOne({ _id: oid }, { $set: update });
  if (!matchedCount) return notFound("Order not found");

  return ok(null, "Order status updated");
}
