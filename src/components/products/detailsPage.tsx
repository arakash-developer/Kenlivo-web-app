"use client";
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductType } from "@/types/AllDataType";
import OrderSummaryCard from "../cards/orderSummaryCard";
import { useCart } from "@/lib/cart/cartContext";
import { useWishlist } from "@/lib/wishlist/wishlistContext";

const shades = [
  { name: "Bombshell", color: "#ed9b8c" },
  { name: "Famous", color: "#a94043" },
  { name: "Icon", color: "#b4415c" },
  { name: "Interview", color: "#d96383" },
  { name: "Wedding Day", color: "#d9c1bb" },
];

const tabs = ["Description", "Reviews"];

export default function DetailsPage({
  productData,
}: {
  productData: ProductType | null;
}) {
  const [selectedShade, setSelectedShade] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");
  const [activeImage, setActiveImage] = useState(0);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const favorite = productData?._id ? isWishlisted(productData._id) : false;
  const [order, setOrder] = useState(false);
  const { addToCart, items } = useCart();
  const added = productData?._id ? items.some((i) => i.product?._id === productData._id) : false;
  const gallery: string[] = productData?.images?.length
    ? productData.images
    : productData?.imageUrl
    ? [productData.imageUrl]
    : [];
  const tabContent: Record<string, string> = {
    Description: productData?.description ?? "",
  };
  if (order) {
    return (
      <div className="w-full">
        <OrderSummaryCard productData={productData as ProductType} />
      </div>
    );
  }
  return (
    <main className="min-h-screen pt-35.5 text-dark-900">
      <div className="mx-auto max-w-screen-2xl px-4 py-5 sm:px-7 lg:px-10">
        {/* Breadcrumb */}
        <div className="flex items-center py-4">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-500">
            <Link href="/" className="transition hover:text-brand-deep">
              Home
            </Link>
            <ChevronRight size={13} />
            <Link
              href={`/category/${(productData?.category as any)?.slug ?? productData?.category ?? ""}`}
              className="transition hover:text-brand-deep"
            >
              {(productData?.category as any)?.name ?? productData?.category}
            </Link>
            <ChevronRight size={13} />
            <span className="text-brand-deep">{productData?.name}</span>
          </nav>
        </div>

        {/* Product section */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product gallery */}
          <div>
            <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 sm:grid-cols-[62px_minmax(0,1fr)]">
              {/* Thumbnails */}
              <div className="flex flex-col gap-2">
                {gallery.map((src, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-bg-blush transition ${
                      activeImage === index
                        ? "border-brand-cta ring-1 ring-brand-cta/20"
                        : "border-brand-300 hover:border-brand-400"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main image area */}
              <div className="relative flex aspect-[1.05/1] min-h-[280px] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-bg-page via-bg-blush to-brand-200 sm:min-h-[380px]">
                {gallery.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gallery[activeImage] ?? gallery[0]}
                    alt={productData?.name || "product"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-muted-400">No Image</span>
                )}

                <button
                  onClick={() => productData && toggleWishlist(productData as ProductType)}
                  aria-label="Add to wishlist"
                  className="absolute right-4 top-4 rounded-full bg-white/90 p-2.5 shadow-sm transition hover:scale-105"
                >
                  <Heart
                    size={19}
                    className={
                      favorite ? "fill-brand-cta text-brand-cta" : "text-dark-500"
                    }
                  />
                </button>
              </div>
            </div>

            {/* Gallery indicators */}
            <div className="mt-4 flex justify-center gap-2 lg:justify-start lg:pl-[75px]">
              {gallery.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Select image ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImage === index
                      ? "w-8 bg-brand-deep"
                      : "w-2 bg-brand-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Product information */}
          <div className="flex flex-col">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-600">
              {(productData?.category as any)?.name ?? productData?.category}
            </p>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
              {productData?.name}
            </h1>

            {productData?.volume ? (
              <p className="mt-1 text-sm text-muted-500">{productData.volume} mL</p>
            ) : null}

            {/* Ratings */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <span className="text-muted-500">4.9</span>
              <span className="mx-1 text-muted-400">|</span>
            </div>

            {/* Price */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold text-brand-deep">
                ৳ {Math.round(Number(productData?.finalPrice ?? productData?.price ?? 0)).toLocaleString()}
              </span>
              {productData?.finalPrice && productData.finalPrice < (productData?.price ?? Infinity) && (
                <span className="text-base text-muted-400 line-through">
                  ৳ {Math.round(Number(productData.price)).toLocaleString()}
                </span>
              )}
              {productData?.discountPercentage && productData.discountPercentage > 0 ? (
                <span className="rounded-md bg-brand-700 px-2 py-0.5 text-xs font-bold text-white">
                  -{productData.discountPercentage}%
                </span>
              ) : null}
            </div>

            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-500">
              {productData?.description}
            </p>

            {/* Shade selector */}
            <div className="mt-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">Color:</span>
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">Quantity</label>
              <div className="flex h-10 w-28 items-center justify-between rounded-md border border-brand-300 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  className="px-3 text-muted-500 hover:text-brand-deep"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  aria-label="Increase quantity"
                  className="px-3 text-muted-500 hover:text-brand-deep"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Purchase buttons */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => addToCart(productData as ProductType, quantity)}
                className="flex h-12 items-center justify-center gap-2 rounded-md bg-brand-cta px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.99]"
              >
                <ShoppingBag size={17} />
                {added ? "Added to Cart ✓" : "Add To Cart"}
              </button>

              <button
                onClick={() => {
                  setOrder(true);
                }}
                className="h-12 rounded-md bg-dark-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-dark-900 active:scale-[0.99]"
              >
                Buy Now
              </button>
            </div>

            {added && (
              <p className="mt-3 text-xs text-emerald-700">
                {quantity} item(s) added to your cart.
              </p>
            )}

            {/* Service benefits */}
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-brand-300 pt-5">
              <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:text-left">
                <ShieldCheck size={20} className="shrink-0 text-gold-700" />
                <span className="text-[10px] leading-4 text-muted-500 sm:text-xs">
                  100% Authentic
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:text-left">
                <Truck size={20} className="shrink-0 text-gold-700" />
                <span className="text-[10px] leading-4 text-muted-500 sm:text-xs">
                  Fast Delivery
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:text-left">
                <RotateCcw size={20} className="shrink-0 text-gold-700" />
                <span className="text-[10px] leading-4 text-muted-500 sm:text-xs">
                  Easy Returns
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Product details tabs */}
        <section className="mt-10 border-t border-brand-300 pt-5 sm:mt-14">
          <div className="flex gap-5 overflow-x-auto border-b border-brand-300 sm:gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 border-b-2 px-1 pb-3 text-xs transition sm:text-sm ${
                  activeTab === tab
                    ? "border-brand-cta font-semibold text-brand-deep"
                    : "border-transparent text-muted-500 hover:text-brand-deep"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="max-w-3xl py-5">
            <h2 className="mb-2 text-sm font-semibold">{activeTab}</h2>
            <p className="text-sm leading-7 text-muted-500">
              {tabContent[activeTab]}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
