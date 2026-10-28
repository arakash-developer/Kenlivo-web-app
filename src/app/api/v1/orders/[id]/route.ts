import { getDb, toId } from "@/lib/v1/db";
import { requireAuth, ok, err, notFound, forbidden } from "@/lib/v1/response";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Ctx) {
  const result = await requireAuth(req);
  if ("cookies" in result) return result;

  const { id } = await params;
  const oid = toId(id);
  if (!oid) return err("Invalid id");

  const db = await getDb();
  const order = await db.collection("orders").findOne({ _id: oid });
  if (!order) return notFound("Order not found");

  const isAdmin = result.user.role === "admin" || result.user.role === "super_admin";
  if (!isAdmin && order.user !== result.user.sub) return forbidden();

  return ok({ ...order, _id: order._id.toString() });
}
