import ProductsPage from "@/components/products/productsPage";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collectionName: string }>;
}) {
  const { collectionName } = await params;
  return <ProductsPage collectionSlug={collectionName} />;
}
