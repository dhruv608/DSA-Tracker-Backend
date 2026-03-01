import { Request, Response } from "express";
import prisma from "../../config/prisma";;
import slugify from "slugify";
import { generateSlug } from "../../utils/slugify";




export const createBatch = async (req: Request, res: Response) => {
  try {
    const { batch_name, year, city_id } = req.body;

    if (!batch_name || !year || !city_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check city exists
    const city = await prisma.city.findUnique({
      where: { id: Number(city_id) },
    });

    if (!city) {
      return res.status(400).json({ error: "City not found" });
    }

    // Generate slug
    const baseSlug = slugify(batch_name, {
      lower: true,
      strict: true,
    });

    // Ensure uniqueness inside same city
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.batch.findFirst({
        where: {
          city_id: Number(city_id),
          slug: finalSlug,
        },
      });

      if (!existing) break;

      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const batch = await prisma.batch.create({
      data: {
        batch_name,
        year,
        city_id: Number(city_id),
        slug: finalSlug,
      },
    });

    res.status(201).json({
      message: "Batch created successfully",
      batch,
    });

  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Batch already exists for this city and year",
      });
    }

    res.status(500).json({ error: "Failed to create batch" });
  }
};


export const getAllBatches = async (req: Request, res: Response) => {
  try {
    const { citySlug, year } = req.query;

    const filters: any = {};

    if (citySlug) {
      const city = await prisma.city.findUnique({
        where: { slug: citySlug as string }
      });

      if (!city) {
        return res.status(404).json({ error: "City not found" });
      }

      filters.city_id = city.id;
    }

    if (year) {
      filters.year = Number(year);
    }

    const batches = await prisma.batch.findMany({
      where: filters,
      include: { city: true }
    });

    res.json(batches);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch batches" });
  }
};


export const updateBatch = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { batch_name, year, city_id } = req.body;

    const existingBatch = await prisma.batch.findUnique({
      where: { id: Number(id) }
    });

    if (!existingBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Determine final values (if not provided, keep old ones)
    const finalBatchName = batch_name ?? existingBatch.batch_name;
    const finalYear = year ?? existingBatch.year;
    const finalCityId = city_id ?? existingBatch.city_id;

    // Check if city exists (if changing city)
    if (city_id) {
      const cityExists = await prisma.city.findUnique({
        where: { id: Number(city_id) }
      });

      if (!cityExists) {
        return res.status(404).json({ error: "City not found" });
      }
    }

    // Check unique constraint manually
    const duplicate = await prisma.batch.findFirst({
      where: {
        city_id: finalCityId,
        year: finalYear,
        batch_name: finalBatchName,
        NOT: { id: existingBatch.id }
      }
    });

    if (duplicate) {
      return res.status(400).json({
        error: "Batch with same name and year already exists in this city"
      });
    }

    // Regenerate slug if name OR city changed
    let newSlug = existingBatch.slug;

    if (batch_name || city_id) {
      const baseSlug = generateSlug(finalBatchName);
      newSlug = baseSlug;
      let counter = 1;

      while (
        await prisma.batch.findFirst({
          where: {
            city_id: finalCityId,
            slug: newSlug,
            NOT: { id: existingBatch.id }
          }
        })
      ) {
        newSlug = `${baseSlug}-${counter++}`;
      }
    }

    const updatedBatch = await prisma.batch.update({
      where: { id: existingBatch.id },
      data: {
        batch_name: finalBatchName,
        year: finalYear,
        city_id: finalCityId,
        slug: newSlug
      }
    });

    return res.json({
      message: "Batch updated successfully",
      batch: updatedBatch
    });

  } catch (error) {
    return res.status(500).json({ error: "Failed to update batch" });
  }
};


export const deleteBatch = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const batch = await prisma.batch.findUnique({
      where: { id }
    });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Check students in this batch
    const studentCount = await prisma.student.count({
      where: { batch_id: batch.id }
    });

    if (studentCount > 0) {
      return res.status(400).json({
        error: "Cannot delete batch with active students"
      });
    }

    await prisma.batch.delete({
      where: { id: batch.id }
    });

    return res.json({
      message: "Batch deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete batch"
    });
  }
};


