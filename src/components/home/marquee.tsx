import { ShieldCheck, Truck, Banknote, CreditCard } from "lucide-react";

const features = [
  { Icon: ShieldCheck, title: "100% Authentic Products", sub: "Verified & Guaranteed" },
  { Icon: Truck, title: "Fast Delivery", sub: "Access Bangladesh" },
  { Icon: Banknote, title: "Cash on Delivery", sub: "Available" },
  { Icon: CreditCard, title: "Secure Payment", sub: "100% Safe & Trusted" },
];

export default function MarqueePage() {
  return (
    <div className="border-y border-brand-300 bg-white">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <div className="grid grid-cols-2 divide-x divide-brand-300 md:grid-cols-4">
          {features.map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 px-4 py-4 md:px-6 md:py-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-dark-900">{title}</p>
                <p className="text-[11px] text-muted-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
