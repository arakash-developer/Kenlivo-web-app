"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useCart } from "@/lib/cart/cartContext";
import { ordersApi, type ShippingZone } from "@/lib/api/orders";
import { getApiErrorMessage } from "@/lib/api/axios";
import type { ShippingAddress } from "@/lib/api/types";

const initialAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  street: "",
  division: "",
  city: "",
  postalCode: "",
  country: "Bangladesh",
};

const districtsByDivision = {
  Barishal: [
    "Barguna",
    "Barishal",
    "Bhola",
    "Jhalokati",
    "Patuakhali",
    "Pirojpur",
  ],
  Chattogram: [
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chattogram",
    "Cumilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachhari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
  ],
  Dhaka: [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
  ],
  Khulna: [
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
  ],
  Mymensingh: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
  Rajshahi: [
    "Bogura",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Chapainawabganj",
    "Pabna",
    "Rajshahi",
    "Sirajganj",
  ],
  Rangpur: [
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon",
  ],
  Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
} as const;

const inputClass =
  "mt-1.5 h-11 w-full rounded-lg border border-brand-300 bg-white px-3 text-sm text-dark-900 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10";

interface ShippingFees {
  insideKurigram: number;
  outsideKurigram: number;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-page" />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const {
    items,
    checkoutProductId,
    clearCart,
    removeFromCart,
    clearCheckoutSelection,
  } = useCart();
  const checkoutItems = checkoutProductId
    ? items.filter(({ product }) => product._id === checkoutProductId)
    : items;
  const totalItems = checkoutItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = checkoutItems.reduce(
    (total, { product, quantity }) =>
      total + (product.finalPrice ?? product.price) * quantity,
    0,
  );
  const [address, setAddress] = useState(initialAddress);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [canViewOrders, setCanViewOrders] = useState(false);
  const [shippingFees, setShippingFees] = useState<ShippingFees | null>(null);
  const [shippingSettingsError, setShippingSettingsError] = useState("");
  const [shippingZone, setShippingZone] =
    useState<ShippingZone>("outside_kurigram");
  useEffect(() => {
    let active = true;
    fetch("/api/v1/shipping-settings")
      .then(async (response) => {
        const result = (await response.json()) as {
          success: boolean;
          data?: ShippingFees;
          message?: string;
        };
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Could not load delivery charges.");
        }
        return result.data;
      })
      .then((fees) => {
        if (active) setShippingFees(fees);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setShippingSettingsError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load delivery charges.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const deliveryFee = shippingFees
    ? shippingZone === "inside_kurigram"
      ? shippingFees.insideKurigram
      : shippingFees.outsideKurigram
    : 0;
  const grandTotal = totalPrice + (checkoutItems.length > 0 ? deliveryFee : 0);

  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setAddress((current) => ({ ...current, [field]: value }));
  };

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const order = await ordersApi.create({
        items: checkoutItems.map(({ product, quantity }) => ({
          product: product._id,
          quantity,
        })),
        shippingAddress: address,
        paymentMethod: "cash_on_delivery",
        shippingZone,
      });
      if (checkoutProductId) removeFromCart(checkoutProductId);
      else clearCart();
      clearCheckoutSelection();
      setCanViewOrders(order.isAuthenticated);
      setOrderId(order._id);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Your order could not be placed."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-page pb-16 pt-36">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10">
          <div className="mb-8 flex items-center justify-center gap-3 text-sm">
            <span className="text-muted-400">Shopping Cart</span>
            <span className="text-brand-700">›</span>
            <span className="font-semibold text-brand-700">Billing Details</span>
            <span className="text-brand-700">›</span>
            <span className="text-muted-400">Confirmation</span>
          </div>

          {orderId ? (
            <section className="mx-auto max-w-xl rounded-2xl border border-brand-300 bg-white p-8 text-center">
              <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
              <h1 className="mt-4 text-2xl font-semibold text-dark-900">Order placed successfully</h1>
              <p className="mt-2 text-sm text-muted-500">
                Your order number is <span className="font-semibold text-dark-900">{orderId}</span>.
              </p>
              <Link
                href={canViewOrders ? "/profile" : "/products"}
                className="mt-6 inline-flex rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800"
              >
                {canViewOrders ? "View my orders" : "Continue shopping"}
              </Link>
            </section>
          ) : checkoutItems.length === 0 ? (
            <section className="flex flex-col items-center rounded-2xl border border-brand-300 bg-white py-20 text-center">
              <ShoppingBag className="size-12 text-brand-300" />
              <h1 className="mt-4 text-xl font-semibold text-dark-900">Your cart is empty</h1>
              <p className="mt-2 text-sm text-muted-500">Add products before continuing to checkout.</p>
              <Link href="/products" className="mt-5 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white">
                Browse products
              </Link>
            </section>
          ) : (
            <>
              <Link href="/cart" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:underline">
                <ArrowLeft className="size-4" />
                Back to cart
              </Link>

              <form onSubmit={placeOrder} className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <section className="rounded-2xl border border-brand-300 bg-white p-5 sm:p-7">
                  <h1 className="text-xl font-semibold text-dark-900">Billing and delivery details</h1>
                  <p className="mt-1 text-sm text-muted-500">Enter the address where you want your order delivered.</p>

                  {error && (
                    <div role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-dark-900">
                      Full name
                      <input
                        className={inputClass}
                        autoComplete="name"
                        required
                        value={address.fullName}
                        onChange={(event) => updateAddress("fullName", event.target.value)}
                      />
                    </label>
                    <label className="text-sm font-medium text-dark-900">
                      Phone number
                      <input
                        className={inputClass}
                        type="tel"
                        autoComplete="tel"
                        required
                        value={address.phone}
                        onChange={(event) => updateAddress("phone", event.target.value)}
                      />
                    </label>
                    <label className="text-sm font-medium text-dark-900 sm:col-span-2">
                      Street address
                      <textarea
                        className={`${inputClass} h-24 resize-y py-3`}
                        autoComplete="street-address"
                        required
                        value={address.street}
                        onChange={(event) => updateAddress("street", event.target.value)}
                      />
                    </label>
                    <label className="text-sm font-medium text-dark-900">
                      Division
                      <select
                        className={inputClass}
                        required
                        value={address.division}
                        onChange={(event) => {
                          updateAddress("division", event.target.value);
                          updateAddress("city", "");
                        }}
                      >
                        <option value="" disabled>
                          Select your division
                        </option>
                        {Object.entries(districtsByDivision).map(
                          ([division]) => (
                            <option key={division} value={division}>
                              {division}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                    <label className="text-sm font-medium text-dark-900">
                      District
                      <select
                        className={inputClass}
                        required
                        disabled={!address.division}
                        value={address.city}
                        onChange={(event) => updateAddress("city", event.target.value)}
                      >
                        <option value="" disabled>
                          {address.division ? "Select your district" : "Select a division first"}
                        </option>
                        {(districtsByDivision[
                          address.division as keyof typeof districtsByDivision
                        ] ?? []).map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm font-medium text-dark-900">
                      Postal code <span className="font-normal text-muted-400">(optional)</span>
                      <input
                        className={inputClass}
                        autoComplete="postal-code"
                        value={address.postalCode}
                        onChange={(event) => updateAddress("postalCode", event.target.value)}
                      />
                    </label>
                    <label className="text-sm font-medium text-dark-900 sm:col-span-2">
                      Country
                      <input
                        className={inputClass}
                        autoComplete="country-name"
                        required
                        value={address.country}
                        onChange={(event) => updateAddress("country", event.target.value)}
                      />
                    </label>
                  </div>

                  <fieldset className="mt-7 border-t border-brand-200 pt-5">
                    <legend className="font-semibold text-dark-900">Payment method</legend>
                    <label className="mt-3 flex items-center gap-3 rounded-lg border border-brand-300 p-4 text-sm">
                      <input type="radio" name="paymentMethod" checked readOnly />
                      Cash on delivery
                    </label>
                  </fieldset>
                </section>

                <div className="grid h-fit gap-4">
                  <section className="rounded-2xl border border-brand-300 bg-white p-5">
                    <h2 className="font-semibold text-dark-900">Delivery area</h2>
                    <p className="mt-1 text-sm text-muted-500">
                      Select your delivery area and charge.
                    </p>
                    <div className="mt-4 grid gap-3">
                      {([
                        ["inside_kurigram", "Inside Kurigram", shippingFees?.insideKurigram],
                        ["outside_kurigram", "Outside Kurigram", shippingFees?.outsideKurigram],
                      ] as const).map(([zone, label, fee]) => (
                        <label
                          key={zone}
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 text-sm transition ${
                            shippingZone === zone
                              ? "border-brand-700 bg-brand-50"
                              : "border-brand-300"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shippingZone"
                              value={zone}
                              checked={shippingZone === zone}
                              onChange={() => setShippingZone(zone)}
                            />
                            <span className="font-medium text-dark-900">{label}</span>
                          </span>
                          <span className="font-semibold text-dark-900">
                            {shippingSettingsError
                              ? "Unavailable"
                              : fee === undefined
                                ? "Loading..."
                                : `৳${fee.toLocaleString()}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </section>

                  <aside className="h-fit rounded-2xl border border-brand-300 bg-white p-5">
                    <h2 className="font-semibold text-dark-900">Order summary</h2>
                    <ul className="mt-4 max-h-60 space-y-3 overflow-y-auto border-b border-brand-200 pb-4">
                      {checkoutItems.map(({ product, quantity }) => (
                        <li key={product._id} className="flex justify-between gap-3 text-sm">
                          <span className="text-muted-500">{product.name} × {quantity}</span>
                          <span className="shrink-0 font-medium text-dark-900">
                            ৳{((product.finalPrice ?? product.price) * quantity).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between text-muted-500">
                        <span>Subtotal ({totalItems} items)</span>
                        <span>৳{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-muted-500">
                        <span>
                          Delivery ({shippingZone === "inside_kurigram"
                            ? "Inside Kurigram"
                            : "Outside Kurigram"})
                        </span>
                        <span>
                          {shippingSettingsError
                            ? "Unavailable"
                            : !shippingFees
                              ? "Loading..."
                              : `৳${deliveryFee.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-brand-200 pt-3 font-bold text-dark-900">
                        <span>Total</span>
                        <span className="text-brand-700">৳{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !shippingFees || Boolean(shippingSettingsError)}
                      className="mt-5 w-full rounded-xl bg-brand-700 py-3 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Placing order..." : "Place order"}
                    </button>
                  </aside>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
