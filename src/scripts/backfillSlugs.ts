
import slugify from "slugify";
import prisma from "../config/prisma";

async function backfillSlugs() {
  console.log("Starting slug backfill...\n");

  // ========================
  // 1️⃣ Cities
  // ========================
  const cities = await prisma.city.findMany();

  for (const city of cities) {
    if (!city.slug) {
      const newSlug = slugify(city.city_name, {
        lower: true,
        strict: true
      });

      await prisma.city.update({
        where: { id: city.id },
        data: { slug: newSlug }
      });

      console.log(`City updated: ${city.city_name} → ${newSlug}`);
    }
  }

  // ========================
  // 2️⃣ Batches
  // ========================
  const batches = await prisma.batch.findMany({
    include: { city: true }
  });

  for (const batch of batches) {
    if (!batch.slug) {
      const baseSlug = slugify(batch.batch_name, {
        lower: true,
        strict: true
      });

      // To ensure uniqueness inside same city
      const newSlug = `${baseSlug}`;

      await prisma.batch.update({
        where: { id: batch.id },
        data: { slug: newSlug }
      });

      console.log(`Batch updated: ${batch.batch_name} → ${newSlug}`);
    }
  }

  // ========================
  // 3️⃣ Topics (if slug exists)
  // ========================
  const topics = await prisma.topic.findMany();

  for (const topic of topics) {
    if (!("slug" in topic)) continue;

    // @ts-ignore
    if (!topic.slug) {
      const newSlug = slugify(topic.topic_name, {
        lower: true,
        strict: true
      });

      await prisma.topic.update({
        where: { id: topic.id },
        data: { slug: newSlug }
      });

      console.log(`Topic updated: ${topic.topic_name} → ${newSlug}`);
    }
  }

  console.log("\nSlug backfill completed ✅");
}

backfillSlugs()
  .catch((err) => {
    console.error("Error during slug backfill:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });