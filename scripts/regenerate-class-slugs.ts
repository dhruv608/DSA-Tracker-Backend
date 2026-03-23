import slugify from "slugify";
import prisma from "../src/config/prisma";

// Add Node.js types for the script
declare const process: {
  exit(code?: number): never;
};

declare const require: {
  main: any;
};
declare const module: any;

/**
 * Script to regenerate slugs for all existing classes
 * This script will:
 * 1. Get all existing classes from the database
 * 2. For each class, regenerate the slug using the current logic
 * 3. Update the class with the new slug
 * 
 * Run this script with: npx ts-node scripts/regenerate-class-slugs.ts
 */

async function regenerateClassSlugs() {
  console.log("🚀 Starting class slug regeneration...");
  
  try {
    // Get all existing classes with their topic and batch information
    const allClasses = await prisma.class.findMany({
      include: {
        topic: {
          select: {
            id: true,
            topic_name: true,
            slug: true,
          },
        },
        batch: {
          select: {
            id: true,
            batch_name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { batch_id: 'asc' },
        { topic_id: 'asc' },
        { id: 'asc' },
      ],
    });

    console.log(`📊 Found ${allClasses.length} classes to process`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const cls of allClasses) {
      try {
        console.log(`\n🔄 Processing: ${cls.class_name} (Batch: ${cls.batch?.batch_name || 'Unknown'}, Topic: ${cls.topic?.topic_name || 'Unknown'})`);
        console.log(`   Current slug: ${cls.slug}`);

        // Generate new slug using the same logic as createClassInTopicService
        const baseSlug = slugify(cls.class_name, {
          lower: true,
          strict: true,
        });

        let newSlug = baseSlug;
        let counter = 1;

        // Check for uniqueness within the same topic + batch (excluding current class)
        while (
          await prisma.class.findFirst({
            where: {
              topic_id: cls.topic_id,
              batch_id: cls.batch_id,
              slug: newSlug,
              NOT: { id: cls.id },
            },
          })
        ) {
          newSlug = `${baseSlug}-${counter++}`;
        }

        // If slug hasn't changed, skip
        if (newSlug === cls.slug) {
          console.log(`   ✅ Slug unchanged: ${newSlug}`);
          skippedCount++;
          continue;
        }

        // Update the class with the new slug
        const updatedClass = await prisma.class.update({
          where: { id: cls.id },
          data: { slug: newSlug },
        });

        console.log(`   ✅ Updated: ${cls.slug} → ${newSlug}`);
        updatedCount++;

      } catch (error) {
        console.error(`   ❌ Error processing class ID ${cls.id}:`, error);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📈 SUMMARY:");
    console.log(`   Total classes processed: ${allClasses.length}`);
    console.log(`   ✅ Successfully updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped (no change): ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log("=".repeat(60));

    if (errorCount > 0) {
      console.log("\n⚠️  Some classes had errors. Please check the logs above.");
      process.exit(1);
    } else {
      console.log("\n🎉 All class slugs have been successfully regenerated!");
    }

  } catch (error) {
    console.error("💥 Fatal error during slug regeneration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  regenerateClassSlugs()
    .then(() => {
      console.log("\n✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Script failed:", error);
      process.exit(1);
    });
}

export default regenerateClassSlugs;
