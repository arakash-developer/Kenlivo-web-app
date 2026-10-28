import { getDb } from "@/lib/v1/db";

// One-time seed endpoint. Hit POST /api/v1/seed to populate initial data.
// Only works in development.
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not available in production" }, { status: 404 });
  }

  const db = await getDb();
  const now = new Date();

  // ── Categories ────────────────────────────────────────────────────────────
  const existingCats = await db.collection("categories").countDocuments();
  let catResult = { inserted: 0, skipped: false };

  if (existingCats === 0) {
    const categories = [
      { name: "Skincare", slug: "skincare", description: "Cleansers, moisturizers, serums and more", image: null, isActive: true },
      { name: "Makeup", slug: "makeup", description: "Foundation, lipstick, eyeshadow and more", image: null, isActive: true },
      { name: "Haircare", slug: "haircare", description: "Shampoos, conditioners, treatments", image: null, isActive: true },
      { name: "Fragrance", slug: "fragrance", description: "Perfumes and body mists", image: null, isActive: true },
      { name: "Body Care", slug: "body-care", description: "Lotions, scrubs and body wash", image: null, isActive: true },
      { name: "Nail Care", slug: "nail-care", description: "Nail polishes and nail treatments", image: null, isActive: true },
    ].map((c) => ({ ...c, createdAt: now, updatedAt: now }));

    const r = await db.collection("categories").insertMany(categories);
    catResult = { inserted: r.insertedCount, skipped: false };
  } else {
    catResult = { inserted: 0, skipped: true };
  }

  // ── Products (sample) ─────────────────────────────────────────────────────
  const existingProds = await db.collection("products").countDocuments();
  let prodResult = { inserted: 0, skipped: false };

  if (existingProds === 0) {
    const cats = await db.collection("categories").find().toArray();
    const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c._id]));

    const products = [
      {
        name: "Hydrating Rose Serum",
        slug: "hydrating-rose-serum",
        description: "A lightweight serum packed with rose extract and hyaluronic acid for deep hydration.",
        tagline: "Glow naturally",
        price: 1200,
        discountPercentage: 10,
        finalPrice: 1080,
        category: bySlug["skincare"],
        images: [],
        stock: 50,
        rating: 4.5,
        numReviews: 24,
        isActive: true,
      },
      {
        name: "Velvet Matte Lipstick",
        slug: "velvet-matte-lipstick",
        description: "Long-lasting matte finish in 12 bold shades.",
        tagline: "Bold & beautiful",
        price: 650,
        discountPercentage: 0,
        finalPrice: 650,
        category: bySlug["makeup"],
        images: [],
        stock: 120,
        rating: 4.3,
        numReviews: 56,
        isActive: true,
      },
      {
        name: "Argan Oil Hair Mask",
        slug: "argan-oil-hair-mask",
        description: "Deep conditioning hair mask with pure argan oil for silky, frizz-free hair.",
        tagline: "Nourish every strand",
        price: 980,
        discountPercentage: 15,
        finalPrice: 833,
        category: bySlug["haircare"],
        images: [],
        stock: 75,
        rating: 4.7,
        numReviews: 38,
        isActive: true,
      },
      {
        name: "Floral Bloom Perfume",
        slug: "floral-bloom-perfume",
        description: "A fresh floral fragrance with top notes of jasmine and rose.",
        tagline: "Smell unforgettable",
        price: 2500,
        discountPercentage: 5,
        finalPrice: 2375,
        category: bySlug["fragrance"],
        images: [],
        stock: 30,
        rating: 4.6,
        numReviews: 19,
        isActive: true,
      },
      {
        name: "Shea Butter Body Lotion",
        slug: "shea-butter-body-lotion",
        description: "Rich, non-greasy body lotion with shea butter and vitamin E.",
        tagline: "Silky soft skin",
        price: 750,
        discountPercentage: 0,
        finalPrice: 750,
        category: bySlug["body-care"],
        images: [],
        stock: 90,
        rating: 4.4,
        numReviews: 62,
        isActive: true,
      },
      {
        name: "Gel Nail Polish Set",
        slug: "gel-nail-polish-set",
        description: "Set of 6 long-lasting gel nail polishes in trending colors.",
        tagline: "Perfect nails every time",
        price: 1450,
        discountPercentage: 20,
        finalPrice: 1160,
        category: bySlug["nail-care"],
        images: [],
        stock: 45,
        rating: 4.2,
        numReviews: 33,
        isActive: true,
      },
    ].map((p) => ({ ...p, createdAt: now, updatedAt: now }));

    const r = await db.collection("products").insertMany(products);
    prodResult = { inserted: r.insertedCount, skipped: false };
  } else {
    prodResult = { inserted: 0, skipped: true };
  }

  return Response.json({
    success: true,
    categories: catResult,
    products: prodResult,
  });
}
