import { NextRequest } from "next/server";
import { getDb, toId, paginate, type ShippingSettings } from "@/lib/v1/db";
import type { ObjectId } from "mongodb";
import { requireAdmin, requireAuth, ok, created, err } from "@/lib/v1/response";

function buildOrderFilter(sp: URLSearchParams, extraFilter: Record<string, unknown> = {}) {
  const filter: Record<string, unknown> = { ...extraFilter };
  const status = sp.get("status");
  if (status) filter.status = status;
  return filter;
}

function isOrderItem(
  item: unknown,
): item is { product: string; quantity: number } {
  if (
    typeof item !== "object" ||
    item === null ||
    !("product" in item) ||
    !("quantity" in item)
  ) {
    return false;
  }

  return (
    typeof item.product === "string" &&
    toId(item.product) !== null &&
    typeof item.quantity === "number" &&
    Number.isSafeInteger(item.quantity) &&
    item.quantity > 0
  );
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

  const { items, shippingAddress, paymentMethod, shippingZone } = body;
  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    !shippingAddress ||
    typeof shippingAddress !== "object" ||
    !shippingAddress.fullName?.trim() ||
    !shippingAddress.phone?.trim() ||
    !shippingAddress.street?.trim() ||
    !shippingAddress.division?.trim() ||
    !shippingAddress.city?.trim() ||
    !paymentMethod ||
    (shippingZone !== "inside_kurigram" &&
      shippingZone !== "outside_kurigram") ||
    !items.every(isOrderItem)
  ) {
    return err("items, shippingAddress and paymentMethod are required");
  }

  const db = await getDb();
  const shippingSettings = await db
    .collection<ShippingSettings>("settings")
    .findOne({ _id: "shipping" });
  const shippingFee = shippingZone === "inside_kurigram"
    ? typeof shippingSettings?.insideKurigram === "number"
      ? shippingSettings.insideKurigram
      : 60
    : typeof shippingSettings?.outsideKurigram === "number"
      ? shippingSettings.outsideKurigram
      : 100;
  const productIds = items
    .map((item: { product: string }) => toId(item.product))
    .filter((id: ObjectId | null): id is ObjectId => id !== null);
  const products = await db.collection("products").find({ _id: { $in: productIds } }).toArray();

  let itemsTotal = 0;
  const orderItems = items.map((item: { product: string; quantity: number }) => {
    const prod = products.find((p) => p._id.toString() === item.product);
    if (!prod) throw new Error(`Product ${item.product} not found`);
    const price = prod.finalPrice ?? prod.price;
    itemsTotal += price * item.quantity;
    return { product: item.product, name: prod.name, price, quantity: item.quantity };
  });

  const grandTotal = itemsTotal + shippingFee;
  const now = new Date();

  const { insertedId } = await db.collection("orders").insertOne({
    user: result.user.sub,
    items: orderItems,
    shippingAddress,
    shippingZone,
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
