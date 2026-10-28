"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Star, ChevronDown, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useProducts, useCategories } from "@/hooks/useProducts";
import type { Product } from "@/lib/api/types";
import { useCart } from "@/lib/cart/cartContext";
import { useWishlist } from "@/lib/wishlist/wishlistContext";
import type { ProductType } from "@/types/AllDataType";

const SORT_OPTIONS = [
  { label: "Popularity", value: "-rating" },
  { label: "Newest", value: "-createdAt" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
];

const PRICE_RANGES = [
  { label: "৳ 0 - ৳ 1,000", min: 0, max: 1000 },
  { label: "৳ 1,000 - ৳ 2,000", min: 1000, max: 2000 },
  { label: "৳ 2,000 - ৳ 3,000", min: 2000, max: 3000 },
  { label: "৳ 3,000+", min: 3000, max: undefined },
];

const RATING_OPTIONS = [4, 3, 2];

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{ width: size, height: size }}
          className={s <= Math.round(rating) ? "fill-[#c96778] text-[#c96778]" : "fill-[#e5cfd1] text-[#e5cfd1]"}
        />
      ))}
    </span>
  );
}

function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0];
  const hasDiscount = product.discountPercentage > 0;
  const { addToCart, items } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const added = items.some((i) => i.product._id === product._id);
  const wishlisted = isWishlisted(product._id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#f0dde0] bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/products/${product._id}`} className="relative block aspect-3/4 overflow-hidden bg-[#fdf5f5]">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(min-width:1024px) 25vw,(min-width:640px) 33vw,50vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingCart className="size-12 text-[#e5cfd1]" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-[#c96778] px-2 py-0.5 text-[11px] font-semibold text-white">
            -{product.discountPercentage}%
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product as unknown as ProductType); }}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition hover:bg-white"
        >
          <Heart className={`size-4 ${wishlisted ? "fill-brand-600 text-brand-600" : "text-muted-500"}`} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/products/${product._id}`}>
          <p className="line-clamp-2 text-sm font-medium leading-snug text-[#2B2622] hover:text-[#c96778]">
            {product.name}
          </p>
        </Link>

        <div className="flex items-center gap-1.5">
          <StarRow rating={product.rating} />
          <span className="text-[11px] text-[#987b7e]">({product.numReviews})</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-[#c96778]">
            ৳ {(product.finalPrice ?? product.price ?? 0).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-[#b3a3a5] line-through">
              ৳ {(product.price ?? 0).toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(product as unknown as ProductType)}
          className={`mt-auto w-full rounded-xl py-2 text-sm font-semibold text-white transition ${added ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#c96778] hover:bg-[#ad5064]"}`}
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

function FilterSidebar({
  categories,
  selectedCategory,
  selectedPrice,
  selectedRating,
  onCategory,
  onPrice,
  onRating,
  onClear,
  onClose,
}: {
  categories: { _id: string; name: string }[];
  selectedCategory: string;
  selectedPrice: number;
  selectedRating: number;
  onCategory: (id: string) => void;
  onPrice: (idx: number) => void;
  onRating: (r: number) => void;
  onClear: () => void;
  onClose?: () => void;
}) {
  const hasFilters = selectedCategory || selectedPrice >= 0 || selectedRating > 0;

  return (
    <aside className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-[#2B2622]">Filter</span>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button onClick={onClear} className="text-xs text-[#c96778] hover:underline">
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="rounded-lg p-1 text-[#987b7e] hover:bg-[#fff5f3]">
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="border-t border-[#f0dde0] pt-4">
        <p className="mb-3 flex items-center justify-between text-sm font-semibold text-[#492a30]">
          Category <ChevronDown className="size-4 text-[#987b7e]" />
        </p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="category"
              checked={!selectedCategory}
              onChange={() => onCategory("")}
              className="accent-[#c96778]"
            />
            <span className="text-sm text-[#65454b]">All Categories</span>
          </label>
          {categories.map((c) => (
            <label key={c._id} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === c._id}
                onChange={() => onCategory(c._id)}
                className="accent-[#c96778]"
              />
              <span className="text-sm text-[#65454b]">{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-[#f0dde0] pt-4">
        <p className="mb-3 flex items-center justify-between text-sm font-semibold text-[#492a30]">
          Price Range <ChevronDown className="size-4 text-[#987b7e]" />
        </p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="price"
              checked={selectedPrice < 0}
              onChange={() => onPrice(-1)}
              className="accent-[#c96778]"
            />
            <span className="text-sm text-[#65454b]">Any Price</span>
          </label>
          {PRICE_RANGES.map((r, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="price"
                checked={selectedPrice === i}
                onChange={() => onPrice(i)}
                className="accent-[#c96778]"
              />
              <span className="text-sm text-[#65454b]">{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="border-t border-[#f0dde0] pt-4">
        <p className="mb-3 flex items-center justify-between text-sm font-semibold text-[#492a30]">
          Rating <ChevronDown className="size-4 text-[#987b7e]" />
        </p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="rating"
              checked={selectedRating === 0}
              onChange={() => onRating(0)}
              className="accent-[#c96778]"
            />
            <span className="text-sm text-[#65454b]">Any Rating</span>
          </label>
          {RATING_OPTIONS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="rating"
                checked={selectedRating === r}
                onChange={() => onRating(r)}
                className="accent-[#c96778]"
              />
              <span className="flex items-center gap-1 text-sm text-[#65454b]">
                <StarRow rating={r} size={12} /> & above
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get("category") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "1");

  const [sort, setSort] = useState("-rating");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedPrice, setSelectedPrice] = useState(-1);
  const [selectedRating, setSelectedRating] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const { data: catData } = useCategories();
  const activeCategories = catData?.items?.filter((c) => c.isActive) ?? [];

  const heroCat = activeCategories.find((c) => c._id === selectedCategory);

  const queryParams: Record<string, unknown> = {
    page: pageParam,
    limit: 12,
    sort,
    ...(selectedCategory ? { category: selectedCategory } : {}),
  };

  const { data, isLoading } = useProducts(queryParams);
  const products = (data?.items ?? []).filter((p) => {
    if (selectedRating > 0 && p.rating < selectedRating) return false;
    if (selectedPrice >= 0) {
      const r = PRICE_RANGES[selectedPrice];
      if (p.finalPrice < r.min) return false;
      if (r.max !== undefined && p.finalPrice > r.max) return false;
    }
    return true;
  });
  const meta = data?.meta;

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
  };

  const handleCategory = (id: string) => {
    setSelectedCategory(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("category", id);
    else params.delete("category");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedPrice(-1);
    setSelectedRating(0);
    router.push("/products");
  };

  const totalFiltered = products.length;

  return (
    <div className="min-h-screen bg-[#fdf8f7]">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#FDEBE5_0%,#F8D2C8_60%,#f0b8c0_100%)]">
        {heroCat?.image && (
          <Image
            src={heroCat.image}
            alt={heroCat.name}
            fill
            className="object-cover object-center opacity-30 mix-blend-multiply"
          />
        )}
        <div className="relative mx-auto max-w-screen-2xl px-6 py-12 md:px-10 md:py-16">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-[#987b7e]">
            <Link href="/" className="hover:text-[#c96778]">Home</Link>
            <span>/</span>
            <span className="text-[#492a30]">{heroCat?.name ?? "Products"}</span>
          </nav>
          <h1 className="font-heading text-4xl font-bold text-[#2B2622] md:text-5xl">
            {heroCat?.name ?? "All Products"}
          </h1>
          {heroCat?.description && (
            <p className="mt-2 max-w-xl text-sm text-[#65454b] md:text-base">{heroCat.description}</p>
          )}
          {!heroCat && (
            <p className="mt-2 text-sm text-[#65454b]">Discover our full collection</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-6 py-8 md:px-10">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden w-56 shrink-0 lg:block">
            <FilterSidebar
              categories={activeCategories}
              selectedCategory={selectedCategory}
              selectedPrice={selectedPrice}
              selectedRating={selectedRating}
              onCategory={handleCategory}
              onPrice={setSelectedPrice}
              onRating={setSelectedRating}
              onClear={clearFilters}
            />
          </div>

          {/* Main */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#ead8d7] bg-white px-3 py-2 text-sm text-[#65454b] shadow-sm hover:bg-[#fff5f3] lg:hidden"
                >
                  <SlidersHorizontal className="size-4" /> Filters
                </button>
                {meta && (
                  <p className="text-sm text-[#987b7e]">
                    Showing {(pageParam - 1) * 12 + 1}–{Math.min(pageParam * 12, meta.total)} of {meta.total} products
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[#987b7e]">Sort by:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none rounded-xl border border-[#ead8d7] bg-white py-2 pl-3 pr-8 text-sm text-[#492a30] outline-none focus:border-[#c96778]"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-[#987b7e]" />
                </div>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-[#f0dde0] bg-white">
                    <div className="aspect-3/4 animate-pulse bg-brand-100" />
                    <div className="space-y-2 p-3">
                      <div className="h-3 w-4/5 animate-pulse rounded bg-[#f4dedb]" />
                      <div className="h-3 w-3/5 animate-pulse rounded bg-[#f4dedb]" />
                      <div className="h-8 animate-pulse rounded-xl bg-[#f4dedb]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#f0dde0] py-24">
                <ShoppingCart className="mb-3 size-12 text-[#e5cfd1]" />
                <p className="text-sm text-[#987b7e]">No products found. Try adjusting your filters.</p>
                <button onClick={clearFilters} className="mt-4 rounded-xl bg-[#c96778] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ad5064]">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, pageParam - 1))}
                  disabled={pageParam === 1}
                  className="flex size-9 items-center justify-center rounded-xl border border-[#ead8d7] text-[#65454b] hover:bg-[#fff5f3] disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - pageParam) <= 1)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`e-${i}`} className="px-1 text-sm text-[#987b7e]">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`flex size-9 items-center justify-center rounded-xl border text-sm font-medium transition-colors ${
                          pageParam === p
                            ? "border-[#c96778] bg-[#c96778] text-white"
                            : "border-[#ead8d7] text-[#65454b] hover:bg-[#fff5f3]"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(Math.min(meta.totalPages, pageParam + 1))}
                  disabled={pageParam === meta.totalPages}
                  className="flex size-9 items-center justify-center rounded-xl border border-[#ead8d7] text-[#65454b] hover:bg-[#fff5f3] disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto h-full w-72 overflow-y-auto bg-white p-5 shadow-xl">
            <FilterSidebar
              categories={activeCategories}
              selectedCategory={selectedCategory}
              selectedPrice={selectedPrice}
              selectedRating={selectedRating}
              onCategory={(id) => { handleCategory(id); setMobileFilterOpen(false); }}
              onPrice={setSelectedPrice}
              onRating={setSelectedRating}
              onClear={() => { clearFilters(); setMobileFilterOpen(false); }}
              onClose={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  );
}
