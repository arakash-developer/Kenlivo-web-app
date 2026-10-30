"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateProduct, useCategories } from "@/hooks/useProducts";
import { useCollections } from "@/hooks/useCollections";
import { getApiErrorMessage } from "@/lib/api/axios";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

const inputClass =
  "h-11 w-full rounded-xl border border-[#ead8d7] bg-[#fffdfc] px-3 text-sm text-[#492a30] placeholder:text-[#c2aaab] outline-none focus:border-[#c66f7d] focus:ring-2 focus:ring-[#f3d5d8]";

const empty = { name: "", category: "", collection: "", price: "", discountPercentage: "", stock: "", tagline: "", images: "", description: "" };

export default function NewProductPage() {
  const router = useRouter();
  const { data: cats } = useCategories();
  const { data: collections } = useCollections();
  const create = useCreateProduct();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const imagePreviews = form.images.split(/[\n,]/).map((u) => u.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim(),
        tagline: form.tagline.trim() || undefined,
        price: Number(form.price),
        discountPercentage: form.discountPercentage ? Number(form.discountPercentage) : undefined,
        stock: form.stock ? Number(form.stock) : undefined,
        category: form.category,
        collection: form.collection,
        images: imagePreviews,
      });
      router.push("/admin/products");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create product"));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="rounded-xl border border-[#ead8d7] p-2 hover:bg-[#fff5f3]">
          <ArrowLeft className="size-4 text-[#65454b]" />
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-[#492a30]">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#f4dedb] bg-white p-6 shadow-sm space-y-4">
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#65454b]">Product Name *</label>
          <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Vitamin C Serum" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#65454b]">Category *</label>
            <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)} required>
              <option value="">Select category</option>
              {cats?.items?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#65454b]">Collection *</label>
            <select className={inputClass} value={form.collection} onChange={(e) => set("collection", e.target.value)} required>
              <option value="">Select collection</option>
              {collections?.map((collection) => <option key={collection._id} value={collection._id}>{collection.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#65454b]">Price (TK) *</label>
          <input type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 1299" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#65454b]">Discount (%)</label>
            <input type="number" min="0" max="100" className={inputClass} value={form.discountPercentage} onChange={(e) => set("discountPercentage", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#65454b]">Stock</label>
            <input type="number" min="0" className={inputClass} value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="0" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#65454b]">Tagline</label>
          <input className={inputClass} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Short catchy tagline" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#65454b]">Image URLs <span className="font-normal text-[#c2aaab]">(one per line)</span></label>
          <textarea rows={3} className={`${inputClass} h-auto py-3 resize-y`} value={form.images} onChange={(e) => set("images", e.target.value)} placeholder="https://…" />
          {imagePreviews.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {imagePreviews.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="preview" className="h-16 w-16 rounded-xl border border-[#f4dedb] object-cover" />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#65454b]">Description *</label>
          <textarea rows={5} className={`${inputClass} h-auto py-3 resize-y`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the product…" required />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/admin/products" className="rounded-xl border border-[#ead8d7] px-4 py-2.5 text-sm text-[#65454b] hover:bg-[#fff5f3]">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={create.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#c96778] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#ad5064] disabled:opacity-60"
          >
            {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
