"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  Minus,
  Plus,
  CheckCircle2,
  Circle,
  MapPin,
} from "lucide-react";
import { Button } from "@heroui/react";
import { ProductType } from "@/types/AllDataType";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

type ShippingMethod = "outside" | "inside";
type PaymentMethod = "cod" | "ssl";

export default function OrderSummaryCard({
  productData,
}: {
  productData: ProductType;
}) {
  const [quantity, setQuantity] = useState(1);
  const [shipping, setShipping] = useState<ShippingMethod>("outside");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const price = Number(productData.price);
  const discount = Number(productData.discount ?? 0);
  const bookDiscount = discount * quantity;
  const subtotal = price * quantity;
  const shippingFee = shipping === "outside" ? 100 : 60;
  // const Discount = discount*quantity ;
  const total = Math.max(0, subtotal /*- Discount*/ + shippingFee);

  const taka = (amount: number) => `৳${amount.toLocaleString("en-US")}`;

  const { data: session } = authClient.useSession();
  const user = session?.user;
  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    if (user) {
      const { email, name } = user;
      const { _id, ...pData } = productData;
      const orderData = {
        username: name,
        email,
        pData,
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_KENLIVO_DATA_API}product-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        },
      );
      const result = await res.json();
      console.log(result);
    }
  }

  return (
    <section className="mx-auto max-w-screen-2xl px-15 py-10">
      <div className="h-32" />
      <div>
        <h2 className="text-3xl mb-5 pl-5">Chackout</h2>
        <form
          className={`space-y-5 ${!user ? "grid grid-cols-3 gap-8" : ""}`}
          onSubmit={placeOrder}
        >
          {!user && (
            <section className="w-full rounded-2xl border border-slate-200 bg-[#fff8f6] p-5 sm:p-7 col-span-2">
              {/* Heading */}
              <div className="mb-6 flex items-center gap-3">
                <MapPin className="h-6 w-6 shrink-0 text-[#B95770]" size={2} />
                <h2 className="text-xl font-semibold text-slate-900">
                  Shipping Information
                </h2>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-base text-slate-700"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-base text-slate-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  required
                  autoComplete="tel"
                  className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Address Section */}
              <div className="pt-1">
                <h3 className="mb-5 text-lg font-medium text-slate-700">
                  Address
                </h3>

                <label
                  htmlFor="address"
                  className="mb-2 block text-base text-slate-700"
                >
                  Detailed address
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  autoComplete="street-address"
                  placeholder="For example: District → Upazila → Area / Elaka  → House No., Road No., etc."
                  className="min-h-[102px] w-full resize-y rounded-xl border border-slate-300 bg-white px-5 py-3 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </section>
          )}

          <main>
            <div className={`mx-auto ${user && "max-w-3xl"} w-full`}>
              <div className="rounded-lg border border-[#F0DAD9] bg-[#FFF8F5] p-[15px] shadow-sm">
                {/* Order Summary */}
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-[#382A2B]">
                    <ShoppingBag
                      className="h-6 w-6 shrink-0 text-[#D96C83]"
                      size={2}
                    />
                    Order Summary
                  </h2>

                  <div className="flex gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <div className="grid gap-2">
                          <div className="flex gap-2">
                            <Image
                              src={productData?.imageUrl as string}
                              alt={productData.name}
                              width={50}
                              height={50}
                              className="rounded-md border border-[#F0DAD9] object-cover"
                            />
                            <p className="text-[#382A2B]">
                              {productData?.name}
                              {productData?.volume ? (
                                <span className="ml-1 text-xs text-[#A99A9A]">{productData.volume} mL</span>
                              ) : null}
                              <br />
                              <span className="text-xs text-[#A99A9A]">{productData?.category}</span>
                            </p>
                          </div>

                          {/* Quantity Selector */}
                          <div className="mt-1.5 flex h-[28px] w-fit items-center rounded-md border border-[#E8CDCE] bg-white">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              disabled={quantity <= 1}
                              onClick={() =>
                                setQuantity((q) => Math.max(1, q - 1))
                              }
                              className="flex h-full w-[28px] items-center justify-center text-[#8B6269] transition hover:bg-[#FCECEF] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={10} />
                            </button>

                            <span className="flex h-full min-w-[28px] items-center justify-center border-x border-[#F0DAD9] text-sm text-[#382A2B]">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => setQuantity((q) => q + 1)}
                              className="flex h-full w-[28px] items-center justify-center text-[#8B6269] transition hover:bg-[#FCECEF]"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-[#382A2B]">
                            {taka(price * quantity)}
                          </p>

                          {Object.hasOwn(productData, "discount") ? (
                            <>
                              <p className="mt-0.5 text-sm text-[#A99A9A] line-through">
                                {taka(discount * quantity)}
                              </p>
                              <span className="inline-block rounded-sm bg-[#FCE4E8] px-1.5 py-0.5 text-xs font-medium text-[#C6536D]">
                                ৳{(discount - price) * quantity} OFF
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="my-4 border-t border-[#F0DAD9]" />

                {/* Shipping */}
                <section>
                  <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#382A2B]">
                    <Truck
                      className="h-5 w-5 shrink-0 text-[#D96C83]"
                      size={2}
                    />
                    Shipping
                  </h2>

                  <div className="space-y-2">
                    <ShippingOption
                      selected={shipping === "outside"}
                      onClick={() => setShipping("outside")}
                      title="Out Side Kurigram City"
                      subtitle="2-3 Working Days"
                      price={100}
                    />

                    <ShippingOption
                      selected={shipping === "inside"}
                      onClick={() => setShipping("inside")}
                      title="Inside Kurigram City"
                      subtitle="1-2 Working Days"
                      price={60}
                    />
                  </div>
                </section>

                <div className="my-4 border-t border-[#F0DAD9]" />

                {/* Payment */}
                <section>
                  <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#382A2B]">
                    <CreditCard
                      className="h-5 w-5 shrink-0 text-[#D96C83]"
                      size={2}
                    />
                    Payment Method
                  </h2>

                  <div className="space-y-2">
                    <PaymentOption
                      selected={payment === "cod"}
                      onClick={() => setPayment("cod")}
                      label="Cash on Delivery"
                    />

                    <PaymentOption
                      selected={payment === "ssl"}
                      onClick={() => setPayment("ssl")}
                      label="bKash, Nogod (Online Payment)"
                    />
                  </div>
                </section>

                {/* Price Breakdown */}
                <section className="mt-4 space-y-2 border-b border-[#F0DAD9] pb-3 text-sm">
                  <PriceRow label="Price" value={taka(subtotal)} />

                  {Object.hasOwn(productData, "discount") && (
                    <PriceRow
                      label="Book Discount"
                      value={`-${taka(bookDiscount)}`}
                      highlight
                    />
                  )}

                  <PriceRow label="Shipping" value={taka(shippingFee)} />
                </section>

                {/* Total */}
                <div className="flex items-center justify-between py-3 text-sm font-bold text-[#382A2B]">
                  <span>Total</span>
                  <span className="text-base text-[#C6536D]">
                    {taka(total)}
                  </span>
                </div>

                {/* Place Order */}
                <Button
                  type="submit"
                  className="w-full items-center rounded-md bg-[#D96C83] font-semibold text-white shadow-sm transition hover:bg-[#C6536D] active:scale-[0.99]"
                >
                  Place Order
                </Button>
              </div>
            </div>
          </main>
        </form>
      </div>
    </section>
  );
}

function ShippingOption({
  selected,
  onClick,
  title,
  subtitle,
  price,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  price: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center justify-between rounded-md border px-4 py-4 text-left transition ${
        selected
          ? "border-[#B95770] bg-[#B95770]/5"
          : "border-gray-200 bg-transparent hover:border-gray-300"
      }`}
    >
      <span className="flex items-center gap-3">
        {selected ? (
          <CheckCircle2
            size={18}
            className="shrink-0 fill-[#B95770] text-[#B95770] [&>path:last-child]:text-white"
          />
        ) : (
          <Circle size={18} className="shrink-0 text-gray-400" />
        )}

        <span className="flex flex-col gap-2">
          <span className="block text-sm leading-4 text-gray-800">{title}</span>
          <span className="block text-xs text-gray-500">{subtitle}</span>
        </span>
      </span>

      <span className="shrink-0 text-gray-800">৳{price}</span>
    </button>
  );
}

function PaymentOption({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex h-10 w-full items-center gap-2 rounded-md border px-2 text-left transition ${
        selected
          ? "border-[#B95770] bg-[#B95770]/5"
          : "border-gray-200 bg-transparent hover:border-gray-300"
      }`}
    >
      {selected ? (
        <CheckCircle2 size={15} className="shrink-0 text-[#B95770]" />
      ) : (
        <Circle size={15} className="shrink-0 text-gray-400" />
      )}
      <span className="text-xs text-gray-800">{label}</span>
    </button>
  );
}

function PriceRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={highlight ? "text-green-600" : "text-gray-500"}>
        {label}
      </span>
      <span className={highlight ? "text-green-600" : "text-gray-800"}>
        {value}
      </span>
    </div>
  );
}
