import { NextRequest } from "next/server";
import { getDb, toId, paginate } from "@/lib/v1/db";
import { requireAdmin, requireAuth, ok, created, err } from "@/lib/v1/response";

function buildOrderFilter(sp: URLSearchParams, extraFilter: Record<string, unknown> = {}) {
  const filter: Record<string, unknown> = { ...extraFilter };
  const status = sp.get("status");
  if (status) filter.status = status;
  return filter;
}

export async function GET(req: NextRequest) {
  const result = await requireAdmin(req);
  if ("cookies" in result) return result;

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 20)));
  const sortParam = sp.get("sort") ?? "-createdAt";
  const sortField = sortParam.startsWith("-") ? sortParam.slice(1) : sortParam;
  const sortDir = sortParam.startsWith("-") ? -1 : 1;

  const filter = buildOrderFilter(sp);
  const db = await getDb();
  const col = db.collection("orders");
  const { skip } = paginate(page, limit);

  const [items, total] = await Promise.all([
    col.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limit).toArray(),
    col.countDocuments(filter),
  ]);

  const mapped = items.map((o) => ({
    ...o,
    _id: o._id.toString(),
    user: typeof o.user === "object" && o.user !== null && "_id" in o.user
      ? { ...(o.user as object), _id: (o.user as { _id: { toString(): string } })._id.toString() }
      : o.user?.toString?.() ?? o.user,
  }));

  return ok(mapped, "OK", { page, limit, total, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const result = await requireAuth(req);
  if ("cookies" in result) return result;

  const body = await req.json().catch(() => null);
  if (!body) return err("Invalid JSON");

  const { items, shippingAddress, paymentMethod } = body;
  if (!items?.length || !shippingAddress || !paymentMethod) {
    return err("items, shippingAddress and paymentMethod are required");
  }

  const db = await getDb();
  const productIds = items.map((i: { product: string }) => toId(i.product)).filter(Boolean);
  const products = await db.collection("products").find({ _id: { $in: productIds } }).toArray();

  let itemsTotal = 0;
  const orderItems = items.map((item: { product: string; quantity: number }) => {
    const prod = products.find((p) => p._id.toString() === item.product);
    if (!prod) throw new Error(`Product ${item.product} not found`);
    const price = prod.finalPrice ?? prod.price;
    itemsTotal += price * item.quantity;
    return { product: item.product, name: prod.name, price, quantity: item.quantity };
  });

  const shippingFee = itemsTotal >= 1000 ? 0 : 60;
  const grandTotal = itemsTotal + shippingFee;
  const now = new Date();

  const { insertedId } = await db.collection("orders").insertOne({
    user: result.user.sub,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsTotal,
    shippingFee,
    grandTotal,
    status: "pending",
    isPaid: false,
    createdAt: now,
    updatedAt: now,
  });

  return created({ _id: insertedId.toString() }, "Order placed");
}
