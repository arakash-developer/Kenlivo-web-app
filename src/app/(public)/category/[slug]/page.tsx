"use client";

import { use, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useProducts";

function CategoryRedirectInner({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: catData } = useCategories();

  useEffect(() => {
    if (!catData?.items) return;

    const decoded = decodeURIComponent(slug).toLowerCase();
    const match = catData.items.find(
      (c) =>
        c.name.toLowerCase() === decoded ||
        c.name.toLowerCase().replace(/\s+/g, "-") === decoded ||
        c._id === slug
    );

    if (match) {
      router.replace(`/products?category=${match._id}`);
    } else {
      router.replace("/products");
    }
  }, [catData, slug, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#f0dde0] border-t-[#c96778]" />
    </div>
  );
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense>
      <CategoryRedirectInner slug={slug} />
    </Suspense>
  );
}
