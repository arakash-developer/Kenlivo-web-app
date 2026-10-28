"use client";

import { useState } from "react";
import Link from "next/link";
import { useProducts, useDeleteProduct, useCategories } from "@/hooks/useProducts";
import { Loader2, Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/axios";
import type { Product } from "@/lib/api/types";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProducts({ search: search || undefined, page, limit: 20, sort: "-createdAt" });
  const { data: cats } = useCategories();
  const deleteProduct = useDeleteProduct();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const products = data?.items ?? [];
  const meta = data?.meta;

  const catName = (p: Product) => {
    if (!p.category) return "—";
    if (typeof p.category === "string") {
      return cats?.items?.find((c) => c._id === p.category)?.name ?? "—";
    }
    return p.category.name;
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    setDeleteError(null);
    try {
      await deleteProduct.mutateAsync(p._id);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Failed to delete product"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[#492a30]">Products</h1>
          {meta && <p className="mt-0.5 text-sm text-[#987b7e]">{meta.total} total</p>}
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#c96778] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#ad5064]"
        >
          <Plus className="size-4" /> Add Product
        </Link>
      </div>

      {deleteError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{deleteError}</p>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#b77b83]" />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-10 w-full rounded-xl border border-[#ead8d7] bg-white pl-9 pr-3 text-sm text-[#492a30] placeholder:text-[#c2aaab] outline-none focus:border-[#c66f7d]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#B95770]" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#f4dedb] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#f4dedb] bg-[#fff8f6]">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#987b7e]">Product</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#987b7e]">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#987b7e]">Price</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#987b7e]">Stock</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#987b7e]">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4dedb]">
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Package className="mx-auto mb-2 size-8 text-[#c2aaab]" />
                      <p className="text-sm text-[#987b7e]">No products found.</p>
                    </td>
                  </tr>
                )}
                {products.map((p) => (
                  <tr key={p._id} className="transition hover:bg-[#fff8f6]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt={p.name} className="size-10 rounded-lg object-cover border border-[#f4dedb]" />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-lg bg-[#fce8e6]">
                            <Package className="size-4 text-[#a84759]" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#492a30]">{p.name}</p>
                          {p.tagline && <p className="text-xs text-[#987b7e]">{p.tagline}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#65454b]">{catName(p)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-[#492a30]">৳{p.finalPrice}</span>
                        {p.discountPercentage > 0 && (
                          <span className="ml-1 text-xs text-[#987b7e] line-through">৳{p.price}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#65454b]">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.isActive ? "bg-[#d1fae5] text-[#065f46]" : "bg-[#fee2e2] text-[#991b1b]"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p._id}/edit`}
                          className="rounded-lg border border-[#ead8d7] p-1.5 text-[#65454b] hover:bg-[#fff5f3] hover:text-[#a84759]"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deleteProduct.isPending}
                          className="rounded-lg border border-[#ead8d7] p-1.5 text-[#65454b] hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#f4dedb] px-4 py-3">
              <p className="text-xs text-[#987b7e]">Page {meta.page} of {meta.totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-[#ead8d7] px-3 py-1 text-xs text-[#65454b] hover:bg-[#fff5f3] disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="rounded-lg border border-[#ead8d7] px-3 py-1 text-xs text-[#65454b] hover:bg-[#fff5f3] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
