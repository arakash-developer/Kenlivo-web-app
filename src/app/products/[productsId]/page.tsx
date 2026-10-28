import { Suspense } from "react";
import DetailsPage from "@/components/products/detailsPage";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { getDb, toId } from "@/lib/v1/db";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ productsId: string }>;
}) {
  const { productsId } = await params;
  let data = null;
  try {
    const oid = toId(productsId);
    if (oid) {
      const db = await getDb();
      const [product] = await db.collection("products").aggregate([
        { $match: { _id: oid } },
        { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $addFields: { _id: { $toString: "$_id" }, "category._id": { $toString: "$category._id" } } },
      ]).toArray();
      data = product ?? null;
    }
  } catch {
    // data stays null
  }
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#f0dde0] border-t-[#c96778]" /></div>}>
        <DetailsPage productData={data} />
      </Suspense>
      <Footer />
    </>
  );
}
