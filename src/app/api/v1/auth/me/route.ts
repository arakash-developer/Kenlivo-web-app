import { getDb, toId } from "@/lib/v1/db";
import { requireAuth } from "@/lib/v1/response";
import { ok, err } from "@/lib/v1/response";

export async function GET(req: Request) {
  const result = await requireAuth(req);
  if ("cookies" in result) return result;

  const db = await getDb();
  const customer = await db.collection("customers").findOne({ _id: toId(result.user.sub)! });
  if (!customer) return err("User not found", 404);

  return ok({
    id: customer._id.toString(),
    name: customer.name,
    email: customer.email,
    role: customer.role,
    phone: customer.phone ?? null,
  });
}
