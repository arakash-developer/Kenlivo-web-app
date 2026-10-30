import { NextResponse } from "next/server";
import { getDb, type ShippingSettings } from "@/lib/v1/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const defaultShippingFees = {
  insideKurigram: 60,
  outsideKurigram: 100,
};

export async function GET() {
  const db = await getDb();
  const settings = await db
    .collection<ShippingSettings>("settings")
    .findOne({ _id: "shipping" });

  return NextResponse.json({
    success: true,
    data: {
      insideKurigram:
        typeof settings?.insideKurigram === "number"
          ? settings.insideKurigram
          : defaultShippingFees.insideKurigram,
      outsideKurigram:
        typeof settings?.outsideKurigram === "number"
          ? settings.outsideKurigram
          : defaultShippingFees.outsideKurigram,
    },
  });
}
