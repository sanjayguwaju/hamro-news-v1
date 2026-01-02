import { getPayload } from "payload";
import config from "../payload.config";
import { seedCategories } from "./seeders/categories";
import { seedTags } from "./seeders/tags";
import { seedAuthors } from "./seeders/authors";
import { seedArticles } from "./seeders/articles";
import { seedPages } from "./seeders/pages";

async function seed() {
  console.log("🌱 Starting database seed...\n");

  const payload = await getPayload({ config });

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing data...");
    await clearCollections(payload);

    // Seed in order of dependencies
    console.log("\n📁 Seeding Categories...");
    const categories = await seedCategories(payload);
    console.log(`   ✅ Created ${categories.length} categories`);

    console.log("\n🏷️  Seeding Tags...");
    const tags = await seedTags(payload);
    console.log(`   ✅ Created ${tags.length} tags`);

    console.log("\n👤 Seeding Authors...");
    const authors = await seedAuthors(payload, []); // Empty array, avatars are optional
    console.log(`   ✅ Created ${authors.length} authors`);

    console.log("\n📰 Seeding Articles...");
    const articles = await seedArticles(payload, {
      categories,
      tags,
      authors,
      articleImages: [],
    });
    console.log(`   ✅ Created ${articles.length} articles`);

    console.log("\n📄 Seeding Pages...");
    const pages = await seedPages(payload);
    console.log(`   ✅ Created ${pages.length} pages`);

    console.log("\n✨ Seed completed successfully!");
    console.log(`
Summary:
  - Categories: ${categories.length}
  - Tags: ${tags.length}
  - Authors: ${authors.length}
  - Articles: ${articles.length}
  - Pages: ${pages.length}

📝 Note: Media (images) were not seeded. You can upload images 
   through the admin panel for authors and articles.
`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }

  process.exit(0);
}

async function clearCollections(payload: Awaited<ReturnType<typeof getPayload>>) {
  const collections = [
    "comments", // Dependent on articles
    "articles",
    "pages",
    "newsletters",
    "authors",
    "tags",
    "categories",
  ] as const;

  for (const collection of collections) {
    try {
      const { docs } = await payload.find({
        collection,
        limit: 1000,
        depth: 0,
      });

      for (const doc of docs) {
        await payload.delete({
          collection,
          id: doc.id,
        });
      }
      console.log(`   Cleared ${collection}: ${docs.length} documents`);
    } catch (error) {
      console.log(`   Skipped ${collection} (may not exist or empty)`);
    }
  }
}

seed().catch(console.error);
