"use client";

import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";

export default function CollectionsPage() {
  const { data: collections, isLoading, isError } = useCollections();

  return (
    <section className="min-h-[60vh] bg-[#fdf8f7]">
      <div className="mx-auto max-w-screen-2xl px-6 py-12 md:px-10 md:py-16">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-[#2B2622] md:text-5xl">
            All Collections
          </h1>
          <p className="mt-2 text-sm text-[#65454b] md:text-base">
            Browse products by collection.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-2xl bg-[#f4dedb]" />
            ))}
          </div>
        ) : isError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Could not load collections. Please try again.
          </p>
        ) : collections?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collections.map((collection) => (
              <Link
                key={collection._id}
                href={`/collections/${encodeURIComponent(collection.slug || collection.name.toLowerCase().replace(/\s+/g, "-"))}`}
                className="group flex min-h-36 items-center justify-between rounded-2xl border border-[#f0dde0] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#c96778]/40 hover:shadow-md"
              >
                <div>
                  <span className="mb-4 grid size-11 place-items-center rounded-full bg-[#fff0ed] text-[#c96778]">
                    <Layers3 className="size-5" />
                  </span>
                  <h2 className="font-heading text-xl font-semibold text-[#2B2622] group-hover:text-[#c96778]">
                    {collection.name}
                  </h2>
                  {collection.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-[#987b7e]">
                      {collection.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="ml-4 size-5 shrink-0 text-[#c96778] transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#987b7e]">No collections available.</p>
        )}
      </div>
    </section>
  );
}
