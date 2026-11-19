const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const candidates = [
  path.resolve(__dirname, '../.env.dev'),
  path.resolve(__dirname, '../.env.prod'),
  path.resolve(__dirname, '../../backend/.env'),
  path.resolve(process.cwd(), '.env.dev'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of candidates) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    if (process.env.DATABASE_URL) break;
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL is not set.');
  process.exit(1);
}

async function seedProducts() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to database for Aatmiya catalog seeding');
    await client.query('BEGIN');

    // 1. Seed Categories with mode_group ('FOODS_ONLY' vs 'DRESS_AND_GIFTS')
    const categoriesData = [
      {
        slug: 'dresses',
        modeGroup: 'DRESS_AND_GIFTS',
        name: {
          en: "Women's Cotton Wear",
          tagline: '100% Breathable Mulmul Cotton Tops & Cambric Pants (Sizes S–XL)',
        },
        description: {
          en: 'Effortless, breathable pure cotton tops and tailored cotton pants for girls and adult women—crafted for all-day comfort.',
        },
      },
      {
        slug: 'kurtas',
        modeGroup: 'DRESS_AND_GIFTS',
        name: {
          en: "Men's Cotton Wear",
          tagline: "Men's Pure Handloom Slub Cotton Shirts & Straight Pants",
        },
        description: {
          en: 'Handpicked pure cotton shirts and breathable cotton trousers for men. Personal fit verified on every order.',
        },
      },
      {
        slug: 'stoles',
        modeGroup: 'DRESS_AND_GIFTS',
        name: {
          en: 'Free-Size Cotton Stoles',
          tagline: 'Free-Size Artisanal Mulmul & Handblock Cotton Stoles',
        },
        description: {
          en: 'Feather-soft free-size pure cotton stoles in natural indigo, maroon, and ivory—ideal for everyday layering or thoughtful gifting.',
        },
      },
      {
        slug: 'hampers',
        modeGroup: 'DRESS_AND_GIFTS',
        name: {
          en: 'Signature Gift Hampers',
          tagline: 'Festive, Family & Corporate Gifting Curations',
        },
        description: {
          en: 'Premium keepsake hampers combining free-size pure cotton stoles, Bilona A2 Cow Ghee, and Dry Fruits Laddus with a personalized family note.',
        },
      },
      {
        slug: 'kids-snacks',
        modeGroup: 'FOODS_ONLY',
        name: {
          en: 'Pure Homemade Foods',
          tagline: 'Pure Bilona A2 Cow Ghee & Organic Jaggery Dry Fruits Laddu',
        },
        description: {
          en: 'Small-batch homemade foods crafted with pure Bilona A2 cow ghee, premium dry fruits, and organic jaggery—zero refined sugar or preservatives.',
        },
      },
    ];

    const activeCategorySlugs = categoriesData.map((c) => c.slug);
    await client.query(
      `UPDATE "categories" SET "is_active" = false, "updated_at" = CURRENT_TIMESTAMP WHERE "slug" != ALL($1::text[]);`,
      [activeCategorySlugs],
    );

    const categoryMap = {};
    for (const cat of categoriesData) {
      const res = await client.query(
        `INSERT INTO "categories" ("slug", "mode_group", "name", "description", "is_active")
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT ("slug") DO UPDATE
         SET "mode_group" = EXCLUDED."mode_group",
             "name" = EXCLUDED."name",
             "description" = EXCLUDED."description",
             "is_active" = true,
             "updated_at" = CURRENT_TIMESTAMP
         RETURNING "id";`,
        [
          cat.slug,
          cat.modeGroup,
          JSON.stringify(cat.name),
          JSON.stringify(cat.description),
        ],
      );
      categoryMap[cat.slug] = res.rows[0].id;
    }

    // 2. Seed Products (5 in Dress/Apparel, 2 in Hamper, 2 in Food = 9 SKUs total)
    const productsData = [
      // --- 5 PRODUCTS IN DRESS / COTTON APPAREL (DRESS_AND_GIFTS) ---
      {
        categorySlug: 'dresses',
        sku: 'HOA-DR-01',
        productType: 'APPAREL',
        name: {
          en: "Girl's Pure Mulmul Cotton Handblock Top",
          subtitle: '100% Soft Breathable Mulmul Cotton • Everyday Comfort',
          badge: 'Signature Cotton',
        },
        description: {
          en: 'Crafted from 100% pure softened mulmul cotton with delicate handblock motifs and a relaxed breathable silhouette for girls and women.',
        },
        usage: {
          en: 'Fabric: 100% Pure Handblock Mulmul Cotton (Pre-washed for zero shrinkage). Care: Gentle cold wash; dry in shade.',
        },
        images: [
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Size S (Bust 36")', costPrice: 480, price: 1190, stockQty: 8, isMadeToBatch: false },
          { sizePack: 'Size M (Bust 38")', costPrice: 480, price: 1190, stockQty: 10, isMadeToBatch: false },
          { sizePack: 'Size L (Bust 40")', costPrice: 480, price: 1190, stockQty: 10, isMadeToBatch: false },
          { sizePack: 'Size XL (Bust 42")', costPrice: 520, price: 1290, stockQty: 6, isMadeToBatch: false },
        ],
      },
      {
        categorySlug: 'dresses',
        sku: 'HOA-DR-02',
        productType: 'APPAREL',
        name: {
          en: "Women's Pure 60s Cambric Cotton Straight Pant",
          subtitle: 'Breathable Pure Cotton Trouser with Deep Side Pockets',
          badge: 'Everyday Essential',
        },
        description: {
          en: 'Tailored from 100% pure 60x60 cambric cotton with a soft elasticated back waistband, relaxed straight leg, and deep functional pockets.',
        },
        usage: {
          en: 'Fabric: 100% Pure 60x60 Cambric Cotton. Pairs effortlessly with cotton tops and kurtas.',
        },
        images: [
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Size S (Waist 28–30")', costPrice: 420, price: 990, stockQty: 8, isMadeToBatch: false },
          { sizePack: 'Size M (Waist 30–32")', costPrice: 420, price: 990, stockQty: 12, isMadeToBatch: false },
          { sizePack: 'Size L (Waist 32–34")', costPrice: 420, price: 990, stockQty: 10, isMadeToBatch: false },
          { sizePack: 'Size XL (Waist 34–36")', costPrice: 450, price: 1090, stockQty: 6, isMadeToBatch: false },
        ],
      },
      {
        categorySlug: 'stoles',
        sku: 'HOA-ST-01',
        productType: 'APPAREL',
        name: {
          en: 'Free-Size Handcrafted Pure Mulmul Cotton Stole',
          subtitle: 'Free Size (2.2m × 0.85m) • Featherlight & Hand-Tasselled',
          badge: 'Free-Size Stole',
        },
        description: {
          en: 'Artisanal free-size pure mulmul cotton stole hand-block printed with natural dyes. Cloud-soft, breathable, and gets softer with every wash.',
        },
        usage: {
          en: 'Dimensions: 220 cm × 85 cm (Free Size). 100% Pure Mulmul Cotton with hand-twisted tassels.',
        },
        images: [
          'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Free Size (Indigo Ajrakh)', costPrice: 360, price: 890, stockQty: 20, isMadeToBatch: false },
          { sizePack: 'Free Size (Earthy Maroon & Ivory)', costPrice: 360, price: 890, stockQty: 15, isMadeToBatch: false },
        ],
      },
      {
        categorySlug: 'kurtas',
        sku: 'HOA-KR-01',
        productType: 'APPAREL',
        name: {
          en: "Men's Pure Handloom Slub Cotton Casual Shirt",
          subtitle: '100% Breathable Textured Cotton with Wooden Buttons',
          badge: "Men's Pure Cotton",
        },
        description: {
          en: 'Crafted in breathable unbleached and indigo handloom-textured pure cotton with natural wooden buttons and a clean relaxed fit for all-day comfort.',
        },
        usage: {
          en: 'Fabric: 100% Pure Handloom Slub Cotton. Pre-shrunk and ideal for Indian summers and casual gatherings.',
        },
        images: [
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Size M (Chest 40")', costPrice: 580, price: 1390, stockQty: 8, isMadeToBatch: false },
          { sizePack: 'Size L (Chest 42")', costPrice: 580, price: 1390, stockQty: 10, isMadeToBatch: false },
          { sizePack: 'Size XL (Chest 44")', costPrice: 580, price: 1390, stockQty: 8, isMadeToBatch: false },
          { sizePack: 'Size XXL (Chest 46")', costPrice: 620, price: 1490, stockQty: 5, isMadeToBatch: false },
        ],
      },
      {
        categorySlug: 'kurtas',
        sku: 'HOA-KR-02',
        productType: 'APPAREL',
        name: {
          en: "Men's Pure Breathable Cotton Straight Pant",
          subtitle: '100% Pure Cotton Relaxed-Fit Trouser with Drawstring & Pockets',
          badge: "Men's Comfort Fit",
        },
        description: {
          en: 'Tailored in sturdy yet breathable 100% pure cotton weave with an adjustable waist, deep side pockets, and a clean straight-leg silhouette.',
        },
        usage: {
          en: 'Fabric: 100% Pure Combed Cotton. Pre-washed for softness and durability.',
        },
        images: [
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Size M (Waist 32")', costPrice: 520, price: 1250, stockQty: 8, isMadeToBatch: false },
          { sizePack: 'Size L (Waist 34")', costPrice: 520, price: 1250, stockQty: 10, isMadeToBatch: false },
          { sizePack: 'Size XL (Waist 36")', costPrice: 520, price: 1250, stockQty: 8, isMadeToBatch: false },
          { sizePack: 'Size XXL (Waist 38")', costPrice: 560, price: 1350, stockQty: 5, isMadeToBatch: false },
        ],
      },

      // --- 2 PRODUCTS IN HAMPER (DRESS_AND_GIFTS) ---
      {
        categorySlug: 'hampers',
        sku: 'HOA-HM-01',
        productType: 'GIFT_HAMPER',
        name: {
          en: 'Classic Family Gift Hamper (Cotton Stole + Dry Fruits Laddu)',
          subtitle: '1 Free-Size Pure Cotton Stole + 250g Dry Fruits Laddu Box + Family Note',
          badge: 'Classic Gift Box',
        },
        description: {
          en: 'A warm keepsake gift box pairing 1 Handcrafted Free-Size Pure Mulmul Cotton Stole with 1 Box of Pure Ghee Dry Fruits Laddus (250g) and a personalized family note.',
        },
        usage: {
          en: 'Ideal for family celebrations, housewarmings, and festive gifting.',
        },
        images: [
          'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Classic Hamper (Stole + 250g Laddu)', costPrice: 620, price: 1490, stockQty: 20, isMadeToBatch: true },
        ],
      },
      {
        categorySlug: 'hampers',
        sku: 'HOA-HM-02',
        productType: 'GIFT_HAMPER',
        name: {
          en: 'Royal Festive Gift Hamper (Cotton Stole + A2 Ghee + Dry Fruits Laddu)',
          subtitle: '1 Pure Cotton Stole + 250ml Bilona A2 Ghee + 250g Dry Fruits Laddu',
          badge: 'Royal Keepsake Box',
        },
        description: {
          en: 'Our grand festive and wedding hamper featuring 1 Free-Size Pure Mulmul Cotton Stole, 1 Glass Jar of Pure Bilona A2 Cow Ghee (250ml), 1 Box of Dry Fruits Laddus (250g), and a wax-sealed gift note.',
        },
        usage: {
          en: 'Available for premium individual gifting and bulk wedding/corporate orders (25–50+ boxes).',
        },
        images: [
          'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Royal Box (Stole + A2 Ghee + Laddu)', costPrice: 950, price: 2290, stockQty: 15, isMadeToBatch: true },
        ],
      },

      // --- 2 PRODUCTS IN FOOD (FOODS_ONLY) ---
      {
        categorySlug: 'kids-snacks',
        sku: 'HOA-FD-01',
        productType: 'FOOD',
        name: {
          en: 'Pure Bilona A2 Cultured Cow Ghee',
          subtitle: 'Traditional Curd-Churned Gir Cow A2 Ghee • Granular & Aromatic',
          badge: 'Fresh Farm Batch',
        },
        description: {
          en: 'Prepared in small batches from A2 milk of grass-fed indigenous Gir cows using the traditional Vedic Bilona curd-churning method over a slow flame.',
        },
        usage: {
          en: 'Ingredients: 100% Pure A2 Cultured Cow Milk Butterfat. Zero preservatives or additives. Shelf life: 9 months in airtight glass jar.',
        },
        images: [
          'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: '250ml Glass Jar', costPrice: 280, price: 650, stockQty: 25, isMadeToBatch: true },
          { sizePack: '500ml Glass Jar', costPrice: 540, price: 1250, stockQty: 15, isMadeToBatch: true },
        ],
      },
      {
        categorySlug: 'kids-snacks',
        sku: 'HOA-FD-02',
        productType: 'FOOD',
        name: {
          en: 'Pure A2 Ghee Dry Fruits & Organic Jaggery Laddu',
          subtitle: 'Almonds, Cashews, Pistachios, Dates & Organic Jaggery • Zero Refined Sugar',
          badge: 'Weekly Fresh Batch',
        },
        description: {
          en: 'Hand-rolled in small weekly kitchen batches using crunchy California almonds, cashews, pistachios, walnuts, soft dates, organic jaggery, and pure Bilona A2 cow ghee.',
        },
        usage: {
          en: 'Ingredients: Almonds, Cashews, Pistachios, Walnuts, Dates, Organic Jaggery, Pure A2 Cow Ghee, Cardamom & Nutmeg. Shelf life: 45 days.',
        },
        images: [
          'https://images.unsplash.com/photo-1605197584547-c93aa1cd8d6b?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: '250g Box (10 Laddus)', costPrice: 220, price: 520, stockQty: 30, isMadeToBatch: true },
          { sizePack: '500g Family Box (20 Laddus)', costPrice: 420, price: 980, stockQty: 20, isMadeToBatch: true },
        ],
      },
    ];

    const activeSkus = productsData.map((p) => p.sku);

    // Clear previous unreferenced products & variants before upserting updated catalog
    // (Any variant referenced by historical order_items is safely deactivated instead of violating FK constraints)
    await client.query(
      `DELETE FROM "product_variants"
       WHERE "product_id" IN (SELECT "id" FROM "products" WHERE "sku" != ALL($1::text[]))
         AND "id" NOT IN (SELECT DISTINCT "variant_id" FROM "order_items");`,
      [activeSkus],
    );
    await client.query(
      `DELETE FROM "products"
       WHERE "sku" != ALL($1::text[])
         AND "id" NOT IN (
           SELECT DISTINCT pv."product_id"
           FROM "product_variants" pv
           JOIN "order_items" oi ON oi."variant_id" = pv."id"
         );`,
      [activeSkus],
    );
    await client.query(
      `UPDATE "product_variants"
       SET "is_available" = false, "is_active" = false
       WHERE "product_id" IN (SELECT "id" FROM "products" WHERE "sku" != ALL($1::text[]));`,
      [activeSkus],
    );
    await client.query(
      `UPDATE "products"
       SET "is_active" = false, "is_featured" = false, "updated_at" = CURRENT_TIMESTAMP
       WHERE "sku" != ALL($1::text[]);`,
      [activeSkus],
    );

    for (const p of productsData) {
      const categoryId = categoryMap[p.categorySlug];
      const prodRes = await client.query(
        `INSERT INTO "products" ("category_id", "sku", "product_type", "name", "description", "usage", "images", "is_featured", "is_active")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         ON CONFLICT ("sku") DO UPDATE
         SET "category_id" = EXCLUDED."category_id",
             "product_type" = EXCLUDED."product_type",
             "name" = EXCLUDED."name",
             "description" = EXCLUDED."description",
             "usage" = EXCLUDED."usage",
             "images" = EXCLUDED."images",
             "is_featured" = EXCLUDED."is_featured",
             "is_active" = true,
             "updated_at" = CURRENT_TIMESTAMP
         RETURNING "id";`,
        [
          categoryId,
          p.sku,
          p.productType,
          JSON.stringify(p.name),
          JSON.stringify(p.description),
          JSON.stringify(p.usage),
          JSON.stringify(p.images),
          p.isFeatured,
        ],
      );
      const productId = prodRes.rows[0].id;

      // Clear unreferenced old variants for this product before upserting current variants
      const activeSizePacks = p.variants.map((v) => v.sizePack);
      await client.query(
        `DELETE FROM "product_variants"
         WHERE "product_id" = $1
           AND "size_pack" != ALL($2::text[])
           AND "id" NOT IN (SELECT DISTINCT "variant_id" FROM "order_items");`,
        [productId, activeSizePacks],
      );
      await client.query(
        `UPDATE "product_variants"
         SET "is_available" = false, "is_active" = false
         WHERE "product_id" = $1 AND "size_pack" != ALL($2::text[]);`,
        [productId, activeSizePacks],
      );

      for (const v of p.variants) {
        const checkVar = await client.query(
          `SELECT id FROM "product_variants" WHERE "product_id" = $1 AND "size_pack" = $2 LIMIT 1;`,
          [productId, v.sizePack],
        );

        if (checkVar.rows.length > 0) {
          await client.query(
            `UPDATE "product_variants"
             SET "cost_price" = $1, "price" = $2, "stock_qty" = $3, "is_made_to_batch" = $4, "is_available" = true, "is_active" = true
             WHERE "id" = $5;`,
            [v.costPrice, v.price, v.stockQty, v.isMadeToBatch, checkVar.rows[0].id],
          );
        } else {
          await client.query(
            `INSERT INTO "product_variants" ("product_id", "size_pack", "cost_price", "price", "stock_qty", "is_made_to_batch", "is_available", "is_active")
             VALUES ($1, $2, $3, $4, $5, $6, true, true);`,
            [productId, v.sizePack, v.costPrice, v.price, v.stockQty, v.isMadeToBatch],
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log('The House of Aatmiya catalog seeded successfully (9 products: 5 Dress/Apparel, 2 Hampers, 2 Foods).');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding products:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedProducts();
