import { Suspense } from "react";
import DetailsPage from "@/components/products/detailsPage";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ productsId: string }>;
}) {
  const { productsId } = await params;
  let data = null;
  try {
    const res = await fetch(
      `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL}/products/${productsId}`,
      { cache: "no-store" }
    );
    const json = await res.json();
    data = json?.data ?? json;
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
