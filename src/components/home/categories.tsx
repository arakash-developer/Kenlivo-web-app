"use client";

import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/hooks/useProducts";
import { Tag } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const lift = "brightness-[1.18]";
const imageClass = `absolute inset-0 h-full w-full object-cover mix-blend-multiply ${lift}`;
const imageSizes = "(min-width: 1280px) 216px, (min-width: 1024px) 24vw, (min-width: 640px) 31vw, 45vw";

export function Categories() {
  const { data, isLoading } = useCategories();

  const active = data?.items?.filter((c) => c.isActive) ?? [];

  if (!isLoading && active.length === 0) return null;

  return (
    <section>
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-14 md:px-10 md:py-20">
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-[#1F1B18] md:text-[2rem]">
            Shop by Category
          </h2>
          <p className="mt-1.5 text-sm text-neutral-400 md:text-base">
            Explore your favorite beauty essentials
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <div className="size-34 animate-pulse rounded-full bg-[#f4dedb]" />
                <div className="h-3 w-16 animate-pulse rounded bg-[#f4dedb]" />
              </div>
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start" }}>
            <CarouselContent className="-ml-8">
              {active.map((cat) => (
                <CarouselItem
                  key={cat._id}
                  className="basis-1/2 pl-8 sm:basis-1/3 lg:basis-1/4 xl:basis-1/6"
                >
                  <Link
                    href={`/category/${encodeURIComponent(cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"))}`}
                    className="group flex flex-col items-center gap-4 text-center"
                  >
                    <span className="relative isolate block aspect-square w-full max-w-54 overflow-hidden rounded-full bg-[linear-gradient(180deg,#FDEBE5_0%,#F8D2C8_100%)] transition-transform duration-300 ease-out group-hover:-translate-y-1">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          width={600}
                          height={600}
                          sizes={imageSizes}
                          className={imageClass}
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center">
                          <Tag className="size-12 text-[#c96778]/40" />
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-medium text-[#2B2622] transition-colors group-hover:text-[#B95770] md:text-base">
                      {cat.name}
                    </span>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-2 hidden bg-white/90 shadow-sm sm:flex xl:hidden" />
            <CarouselNext className="right-2 hidden bg-white/90 shadow-sm sm:flex xl:hidden" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
