"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ProductType } from "@/types/AllDataType";
import { Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";

export function EditButton({ product }: { product: ProductType }) {
  return <EditButtonForm key={product._id} product={product} />;
}

function EditButtonForm({ product }: { product: ProductType }) {
  const [form, setForm] = useState<ProductType>(product);

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const {_id, ...updetedData} = form
  const categoryValue =
    typeof form.category === "string"
      ? form.category
      : form.category?._id ?? "";
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_KENLIVO_DATA_API}products/${_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updetedData),
    });
    const result = await res.json();
    console.log(result);
  };

  const inputClass =
    "mt-1.5 w-full border border-gray-100 bg-[#f6f8fa] px-3 py-2 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#B95770] focus:bg-white rounded-md";

  const fields = [
    {
      name: "name",
      label: "Products Name",
      placeholder: form.name,
      value: form.name,
      full: true,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      value: categoryValue,
      options: ["Cream", "Face Wash", "Lotion", "Sunscreen", "Serum"],
    },
    {
      name: "price",
      label: "Price (TK)",
      placeholder: "e.g., 1299",
      value: form.price,
      type: "number",
    },
    {
      name: "producttagline",
      label: "Product Tagline",
      placeholder: "Product Tagline",
      value: form.producttagline,
      full: true,
    },
    {
      name: "imageUrl",
      label: "Image URL",
      placeholder: "https://example.com/image.jpg",
      type: "url",
      value: form.imageUrl,
      full: true,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline">
            <CiEdit />
            Edit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <h2 className="flex flex-col text-neutral-500"><span className="text-xl font-semibold text-black">Update Product</span>Make changes to the product details below</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={field.full ? "sm:col-span-2" : ""}
              >
                <label
                  htmlFor={field.name}
                  className="block font-semibold text-[#222]"
                >
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.value}
                    onChange={(event) => update("category", event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type || "text"}
                    value={field.value}
                    onChange={(event) =>
                      update(
                        field.name as keyof ProductType,
                        event.target.value,
                      )
                    }
                    placeholder={field.placeholder || ""}
                    min={field.type === "number" ? "0" : undefined}
                    step={field.type === "number" ? "0.01" : undefined}
                    className={inputClass}
                  />
                )}
              </div>
            ))}

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block font-semibold text-[#222]"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={(event)=>{
                    update(
                        "description",
                        event.target.value
                    )
                }}
                rows={5}
                placeholder="Describe the travel experience..."
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2.5">
            <button
              type="button"
              className="inline-flex h-[36px] items-center justify-center gap-1.5 border border-[#ff6b6b] px-3.5 text-[11px] text-[#ff5252] transition hover:bg-red-50 rounded-md"
            >
              <Trash2 size={12} />
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex h-[36px] items-center justify-center gap-1.5 bg-[#B95770] px-4 text-[11px] text-white transition hover:bg-[#a1576a] rounded-md"
            >
              <Save size={12} />
              Add Product
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
