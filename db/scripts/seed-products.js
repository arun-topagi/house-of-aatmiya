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
        slug: 'kids-snacks',
        modeGroup: 'FOODS_ONLY',
        name: {
          en: "Kids' Clean Snacks & Pantry",
          tagline: 'Ages 3+ • Zero Maida • Organic Jaggery • Pure Ghee',
        },
        description: {
          en: 'Small-batch homemade foods made by Snehal the way we make them for Saharsha & Sreeja. No refined sugar, no maida, no artificial colours.',
        },
      },
      {
        slug: 'dresses',
        modeGroup: 'DRESS_AND_GIFTS',
        name: {
          en: "Women's Pure Cotton Dresses",
          tagline: '100% Breathable Mulmul & Handblock Cotton (Sizes S–XL)',
        },
        description: {
          en: 'Effortless, breathable pure cotton midi and tiered dresses for adult women—crafted for all-day comfort and timeless elegance.',
        },
      },
      {
        slug: 'kurtas',
        modeGroup: 'DRESS_AND_GIFTS',
        name: {
          en: 'Pure Cotton Kurtas & Co-ords',
          tagline: "Women's Kurta Sets & Classic Men's Kurtas",
        },
        description: {
          en: 'Handpicked pure cotton weaves tailored with precision. Personal fit and size verified by Snehal on every order.',
        },
      },
      {
        slug: 'stoles',
        modeGroup: 'DRESS_AND_GIFTS',
        name: {
          en: 'Handcrafted Cotton Stoles',
          tagline: 'Free-Size Artisanal Mulmul & Indigo Weaves',
        },
        description: {
          en: 'Feather-soft pure cotton stoles in natural indigo, maroon, and ivory—ideal for everyday layering or thoughtful gifting.',
        },
      },
      {
        slug: 'hampers',
        modeGroup: 'DRESS_AND_GIFTS',
        name: {
          en: 'Signature Gift Hampers',
          tagline: 'Diwali, Wedding & Corporate Gifting Curations',
        },
        description: {
          en: 'Premium rigid-box hampers combining free-size pure cotton stoles and small-batch artisanal foods with a personalized family note.',
        },
      },
    ];

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

    // 2. Seed Hero Products (11 SKUs across Kids' Snacks, Adult Women's Dresses, Kurtas, Stoles & Hampers)
    const productsData = [
      // --- KIDS' SNACKS (FOODS_ONLY) ---
      {
        categorySlug: 'kids-snacks',
        sku: 'HOA-KS-01',
        name: {
          en: 'Sprouted Ragi-Almond-Jaggery Health Drink Mix',
          subtitle: 'Ages 3+ • Zero Refined Sugar • Rich in Calcium & Iron',
          badge: 'Fresh Weekly Batch',
        },
        description: {
          en: 'Slow-roasted sprouted ragi, California almonds, cashews, cardamom, and organic jaggery powder. Gently sweetened and easy to digest for growing kids and mothers.',
        },
        usage: {
          en: 'Ingredients: Sprouted Ragi (60%), Almonds (20%), Organic Jaggery (15%), Cardamom & Nutmeg. Shelf life: 90 days in airtight glass jar. Mix 2 tbsp in warm milk.',
        },
        images: [
          'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: '250g Glass Jar', costPrice: 165, price: 390, stockQty: 25, isMadeToBatch: true },
          { sizePack: '500g Family Jar', costPrice: 310, price: 720, stockQty: 15, isMadeToBatch: true },
        ],
      },
      {
        categorySlug: 'kids-snacks',
        sku: 'HOA-KS-02',
        name: {
          en: 'Pure A2 Ghee Ragi & Jaggery Cookies',
          subtitle: '100% Zero Maida • Baked with Cultured Ghee',
          badge: 'Bestseller in Society',
        },
        description: {
          en: 'Melt-in-the-mouth millet cookies baked in small batches using pure cow ghee, whole ragi flour, and organic jaggery. Zero baking soda, maida, or palm oil.',
        },
        usage: {
          en: 'Ingredients: Whole Ragi Flour, Pure Cow Ghee, Organic Jaggery, Crushed Almonds, Cardamom. Shelf life: 45 days. Ideal 4 PM tiffin snack for ages 3+.',
        },
        images: [
          'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: '200g Tin (14 Cookies)', costPrice: 140, price: 340, stockQty: 30, isMadeToBatch: true },
          { sizePack: '400g Value Tin', costPrice: 260, price: 620, stockQty: 15, isMadeToBatch: true },
        ],
      },
      {
        categorySlug: 'kids-snacks',
        sku: 'HOA-KS-03',
        name: {
          en: 'Soft Jaggery & Roasted Peanut Chikki Bites',
          subtitle: 'Bite-Sized • No Liquid Glucose • Ages 3+',
          badge: 'Kids Tiffin Favourite',
        },
        description: {
          en: 'Unlike hard commercial chikkis made with liquid glucose, Snehal crafts these soft, easy-to-bite squares using aged organic Kolhapur jaggery, roasted peanuts, and a touch of pure ghee.',
        },
        usage: {
          en: 'Ingredients: Roasted Peanuts, Organic Kolhapur Jaggery, Pure Ghee, Dry Ginger Powder. Shelf life: 60 days.',
        },
        images: [
          'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: false,
        variants: [
          { sizePack: '200g Jar (20 Bites)', costPrice: 115, price: 280, stockQty: 30, isMadeToBatch: true },
        ],
      },
      {
        categorySlug: 'kids-snacks',
        sku: 'HOA-KS-04',
        name: {
          en: "Kids' Mild Ghee-Roasted Phool Makhana",
          subtitle: 'Hand-Roasted in Pure Ghee with Pink Salt & Turmeric',
          badge: 'Crunchy & Clean',
        },
        description: {
          en: 'Export-grade jumbo Bihar lotus seeds slow-roasted in pure cow ghee and lightly dusted with rock salt and organic turmeric. Zero seed oils or artificial flavour enhancers.',
        },
        usage: {
          en: 'Ingredients: Jumbo Phool Makhana, Pure Cow Ghee, Sendha Namak, Organic Haldi. Shelf life: 60 days.',
        },
        images: [
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: '100g Airtight Jar', costPrice: 120, price: 290, stockQty: 25, isMadeToBatch: true },
          { sizePack: '200g Family Pack', costPrice: 225, price: 540, stockQty: 15, isMadeToBatch: true },
        ],
      },

      // --- ADULT WOMEN'S PURE COTTON DRESSES (DRESS_AND_GIFTS) ---
      {
        categorySlug: 'dresses',
        sku: 'HOA-DR-01',
        name: {
          en: 'Indigo Dabu Handblock Pure Cotton Tiered Midi Dress',
          subtitle: "Adult Women's 100% Mulmul Cotton • Breathable Everyday Luxury",
          badge: 'Signature Indigo',
        },
        description: {
          en: 'Crafted from 100% pure 60x60 cambric and mulmul cotton in natural indigo handblock prints. Designed for adult women with concealed side pockets, a flattering tiered silhouette, and zero synthetic lining.',
        },
        usage: {
          en: 'Fabric: 100% Pure Handblock Cotton (Pre-washed for zero shrinkage). Care: Gentle cold hand wash separately in mild detergent; dry in shade.',
        },
        images: [
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Size S (Bust 36")', costPrice: 780, price: 1850, stockQty: 5, isMadeToBatch: false },
          { sizePack: 'Size M (Bust 38")', costPrice: 780, price: 1850, stockQty: 8, isMadeToBatch: false },
          { sizePack: 'Size L (Bust 40")', costPrice: 780, price: 1850, stockQty: 8, isMadeToBatch: false },
          { sizePack: 'Size XL (Bust 42")', costPrice: 820, price: 1950, stockQty: 5, isMadeToBatch: false },
        ],
      },
      {
        categorySlug: 'dresses',
        sku: 'HOA-DR-02',
        name: {
          en: 'Earthy Maroon & Ivory Bagh-Print Pure Cotton A-Line Dress',
          subtitle: "Adult Women's Relaxed Fit • With Concealed Pockets",
          badge: 'New Capsule Drop',
        },
        description: {
          en: 'An heirloom-inspired maroon and off-white pure cotton dress for women. Features delicate kantha-stitch detailing on the yoke and three-quarter sleeves for effortless work-to-weekend wear.',
        },
        usage: {
          en: 'Fabric: 100% Pure Softened Mulmul Cotton. Snehal confirms exact bust and length measurements on your order confirmation call.',
        },
        images: [
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Size S (Bust 36")', costPrice: 820, price: 1990, stockQty: 4, isMadeToBatch: false },
          { sizePack: 'Size M (Bust 38")', costPrice: 820, price: 1990, stockQty: 6, isMadeToBatch: false },
          { sizePack: 'Size L (Bust 40")', costPrice: 820, price: 1990, stockQty: 6, isMadeToBatch: false },
          { sizePack: 'Size XL (Bust 42")', costPrice: 850, price: 2090, stockQty: 4, isMadeToBatch: false },
        ],
      },

      // --- PURE COTTON KURTAS (DRESS_AND_GIFTS) ---
      {
        categorySlug: 'kurtas',
        sku: 'HOA-KR-01',
        name: {
          en: "Women's Ivory & Forest Green Pure Cotton Kurta Co-ord Set",
          subtitle: '2-Piece Pure Cotton Kurta & Straight Trouser Set',
          badge: 'Pure 60s Cotton',
        },
        description: {
          en: 'Tailored from breathable 100% Jaipur pure cotton with botanical motifs, paired with comfortable elasticated-back cotton trousers with deep pockets.',
        },
        usage: {
          en: 'Fabric: 100% Pure 60x60 Cambric Cotton. Fit verified personally on WhatsApp confirmation call.',
        },
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Size S (36")', costPrice: 950, price: 2290, stockQty: 5, isMadeToBatch: false },
          { sizePack: 'Size M (38")', costPrice: 950, price: 2290, stockQty: 8, isMadeToBatch: false },
          { sizePack: 'Size L (40")', costPrice: 950, price: 2290, stockQty: 8, isMadeToBatch: false },
          { sizePack: 'Size XL (42")', costPrice: 990, price: 2390, stockQty: 5, isMadeToBatch: false },
        ],
      },
      {
        categorySlug: 'kurtas',
        sku: 'HOA-KR-02',
        name: {
          en: "Men's Classic Off-White & Indigo Slub Cotton Straight Kurta",
          subtitle: '100% Pure Handloom-Textured Cotton for Festive & Casual Wear',
          badge: "Men's Classic",
        },
        description: {
          en: 'Understated elegance for men. Crafted in breathable unbleached off-white and deep indigo slub cotton with wooden buttons and a clean mandarin collar.',
        },
        usage: {
          en: 'Fabric: 100% Pure Handloom Slub Cotton. Pre-shrunk and breathable in Indian summers and festive gatherings.',
        },
        images: [
          'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: false,
        variants: [
          { sizePack: 'Size M (Chest 40")', costPrice: 680, price: 1590, stockQty: 6, isMadeToBatch: false },
          { sizePack: 'Size L (Chest 42")', costPrice: 680, price: 1590, stockQty: 8, isMadeToBatch: false },
          { sizePack: 'Size XL (Chest 44")', costPrice: 680, price: 1590, stockQty: 6, isMadeToBatch: false },
          { sizePack: 'Size XXL (Chest 46")', costPrice: 720, price: 1690, stockQty: 4, isMadeToBatch: false },
        ],
      },

      // --- COTTON STOLES (DRESS_AND_GIFTS) ---
      {
        categorySlug: 'stoles',
        sku: 'HOA-ST-01',
        name: {
          en: 'Artisanal Indigo & Ajrakh Pure Mulmul Cotton Stole',
          subtitle: 'Free Size (2.2m × 0.7m) • Featherlight & Hand-Tasselled',
          badge: 'Zero-Size-Risk Gift',
        },
        description: {
          en: 'Hand-block printed with natural indigo dyes on cloud-soft pure mulmul cotton. Gets softer with every wash and pairs effortlessly with kurtas, dresses, or denim.',
        },
        usage: {
          en: 'Dimensions: 220 cm × 70 cm (Free Size). 100% Pure Mulmul Cotton with hand-twisted tassels.',
        },
        images: [
          'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Free Size (Indigo Motif)', costPrice: 340, price: 890, stockQty: 20, isMadeToBatch: false },
          { sizePack: 'Free Size (Maroon & Ivory)', costPrice: 340, price: 890, stockQty: 15, isMadeToBatch: false },
        ],
      },

      // --- GIFT HAMPERS (DRESS_AND_GIFTS) ---
      {
        categorySlug: 'hampers',
        sku: 'HOA-HM-01',
        name: {
          en: 'The House of Aatmiya Signature Family & Festive Hamper',
          subtitle: '1 Pure Cotton Stole + 2 Artisanal Foods + Personalized Note',
          badge: 'Hero Gift Box',
        },
        description: {
          en: 'Our signature keepsake box bringing together 1 Handblock Pure Mulmul Cotton Stole, 1 Jar of Pure Ghee Ragi Cookies (200g), 1 Jar of Ghee-Roasted Makhana (100g), and a wax-sealed family note from Arun & Snehal.',
        },
        usage: {
          en: 'Available for individual festive gifting and bulk wedding/corporate orders (25–50+ boxes) with custom ribbon & family crest.',
        },
        images: [
          'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80',
        ],
        isFeatured: true,
        variants: [
          { sizePack: 'Classic Hamper (Stole + 2 Jars)', costPrice: 680, price: 1690, stockQty: 20, isMadeToBatch: true },
          { sizePack: 'Grand Royal Box (Stole + All 4 Foods)', costPrice: 1050, price: 2490, stockQty: 10, isMadeToBatch: true },
        ],
      },
    ];

    for (const p of productsData) {
      const categoryId = categoryMap[p.categorySlug];
      const prodRes = await client.query(
        `INSERT INTO "products" ("category_id", "sku", "name", "description", "usage", "images", "is_featured", "is_active")
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT ("sku") DO UPDATE
         SET "category_id" = EXCLUDED."category_id",
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
          JSON.stringify(p.name),
          JSON.stringify(p.description),
          JSON.stringify(p.usage),
          JSON.stringify(p.images),
          p.isFeatured,
        ],
      );
      const productId = prodRes.rows[0].id;

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
    console.log('The House of Aatmiya catalog seeded successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding products:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedProducts();
