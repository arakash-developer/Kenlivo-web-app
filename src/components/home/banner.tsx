import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=80";

export function Banner() {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#FFF9F2_0%,#FDEBE5_45%,#f0dde0_100%)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_78%_45%,rgba(255,255,255,0.6),transparent_72%)]"
      />

      {/* Product collage, feathered into the background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[54%] lg:block"
      >
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="55vw"
          quality={80}
          className="object-cover [mask-image:linear-gradient(to_right,transparent_0%,#000_24%)]"
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-7.75rem)] max-w-screen-2xl flex-col justify-center gap-12 px-6 py-16 md:px-10 lg:flex-row lg:items-center lg:justify-start lg:gap-16 lg:py-20">
        <div className="lg:w-1/2 lg:max-w-xl">
          <p className="text-sm font-bold tracking-[0.14em] text-brand-600 uppercase">
            Your beauty, our passion
          </p>

          <h1 className="mt-5 font-heading text-[2.75rem] leading-[1.08] font-medium text-dark-900 md:text-6xl xl:text-7xl">
            Glow Naturally,
            <br />
            Look Beautiful
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-500 md:text-xl">
            Explore premium cosmetics, skincare, makeup &amp; more — all in one
            place.
          </p>

          <div className="mt-9">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 rounded-full bg-brand-cta px-8 py-4 text-base font-semibold text-white shadow-[0_16px_32px_-16px_rgba(185,87,112,0.9)] transition-colors hover:bg-brand-700"
            >
              Shop Now
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* Stacked image on smaller screens */}
        <div className="relative h-64 overflow-hidden rounded-[2rem] sm:h-80 lg:hidden">
          <Image
            src={heroImage}
            alt="Makeup brushes, lipstick and a powder compact on a soft pink background"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
