import ProductsPage from "@/components/products/productsPage";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductsPage categorySlug={slug} />;
}
