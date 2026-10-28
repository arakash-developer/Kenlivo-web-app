'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductType } from "@/types/AllDataType";
import { Heart, ShoppingCart, Star } from "lucide-react";

export default function TrendingProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=4&sort=-rating`);
        const data = await res.json();
        setProducts(data?.data ?? data?.items ?? []);
      } catch { /* silent */ }
    };
    getData();
  }, []);

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 py-12 md:px-10 md:py-16">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-900 md:text-3xl">Trending Products</h2>
          <p className="mt-1 text-sm text-muted-500">Best selling products loved by our customers</p>
        </div>
        <Link href="/products" className="text-sm font-semibold text-brand-700 hover:underline">
          View All →
        </Link>
      </div>

      {/* 4-column square grid */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {products.length === 0
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-brand-300 bg-white">
                <div className="aspect-square animate-pulse bg-brand-100" />
                <div className="space-y-2 p-3">
                  <div className="h-3 w-4/5 animate-pulse rounded bg-brand-200" />
                  <div className="h-3 w-2/5 animate-pulse rounded bg-brand-200" />
                  <div className="h-8 animate-pulse rounded-xl bg-brand-200" />
                </div>
              </div>
            ))
          : products.slice(0, 4).map((product) => (
              <TrendingCard key={product._id} product={product} />
            ))}
      </div>
    </div>
  );
}

function TrendingCard({ product }: { product: ProductType }) {
  const [wished, setWished] = useState(false);
  const img = product.images?.[0] || product.imageUrl;
  const price = product.finalPrice ?? product.price ?? 0;
  const originalPrice = product.discountPercentage && product.discountPercentage > 0 ? product.price : null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-brand-300 bg-white shadow-sm transition hover:shadow-md">
      {/* Square image */}
      <Link href={`/products/${product._id}`} className="relative block aspect-square overflow-hidden bg-bg-blush">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingCart className="size-10 text-brand-400" />
          </div>
        )}
        {product.discountPercentage && product.discountPercentage > 0 ? (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-brand-700 px-2 py-0.5 text-[11px] font-bold text-white">
            -{product.discountPercentage}%
          </span>
        ) : null}
        <button
          onClick={(e) => { e.preventDefault(); setWished((w) => !w); }}
          className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Heart className={`size-4 ${wished ? "fill-brand-700 text-brand-700" : "text-muted-400"}`} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-3">
        <p className="truncate text-[13px] font-semibold text-dark-900">{product.name}</p>
        <div className="mt-1 flex items-center gap-0.5">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`size-3 ${s <= Math.round(product.rating ?? 0) ? "fill-brand-600 text-brand-600" : "fill-brand-300 text-brand-300"}`} />
          ))}
          <span className="ml-1 text-[11px] text-muted-500">({product.numReviews ?? 0})</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-base font-bold text-brand-700">৳{Number(price).toLocaleString()}</span>
          {originalPrice && <span className="text-xs text-muted-400 line-through">৳{Number(originalPrice).toLocaleString()}</span>}
        </div>
        <button className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-700 py-2 text-xs font-semibold text-white transition hover:bg-brand-800">
          <ShoppingCart className="size-3.5" /> Add to Cart
        </button>
      </div>
    </div>
  );
}
