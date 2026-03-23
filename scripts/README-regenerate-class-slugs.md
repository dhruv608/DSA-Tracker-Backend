# Class Slug Regeneration Script

This script regenerates slugs for all existing classes using the current slug generation logic.

## What it does

1. **Fetches all existing classes** from the database with their topic and batch information
2. **Regenerates slugs** using the same logic as `createClassInTopicService`:
   - Uses `slugify` with `lower: true` and `strict: true` options
   - Ensures uniqueness within the same topic + batch combination
   - Adds numeric suffixes if duplicates are found (e.g., `class-name-1`, `class-name-2`)
3. **Updates each class** with the new slug (only if it changed)
4. **Provides detailed logging** of the process

## When to use

- When you've updated the slug generation logic and need to apply it to existing classes
- When existing class slugs are incorrect or inconsistent
- After database migrations that affect slug formatting

## How to run

```bash
# From the backend directory
npm run regenerate-class-slugs

# Or directly with tsx
npx tsx scripts/regenerate-class-slugs.ts
```

## Safety features

- **Dry run preview**: Shows what will be changed before updating
- **Error handling**: Continues processing even if individual classes fail
- **Detailed logging**: Shows current vs new slugs and summary statistics
- **Database safety**: Uses Prisma transactions and proper connection handling

## Output

The script provides:
- Real-time progress updates for each class
- Summary statistics (updated, skipped, errors)
- Detailed error messages if any failures occur

## Notes

- The script only updates slugs that have changed
- Existing class relationships and data remain intact
- The unique constraint `[topic_id, batch_id, slug]` is maintained
- Database connection is automatically closed when complete
