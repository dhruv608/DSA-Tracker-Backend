import { Request, Response } from "express";
import prisma from "../../config/prisma";
import slugify from "slugify";


//  HELPER: Generate Global Unique Batch Slug


const generateBatchSlug = (
  citySlug: string,
  batchName: string,
  year: number
) => {
  return `${citySlug}-${slugify(batchName, {
    lower: true,
    strict: true,
  })}-${year}`;
};


//  CREATE BATCH

export const createBatch = async (req: Request, res: Response) => {
  try {
    const { batch_name, year, city_id } = req.body;

    if (!batch_name || !year || !city_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const city = await prisma.city.findUnique({
      where: { id: Number(city_id) },
    });

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    // Prevent duplicate batch name + year in same city
    const duplicate = await prisma.batch.findFirst({
      where: {
        city_id: Number(city_id),
        year: Number(year),
        batch_name,
      },
    });

    if (duplicate) {
      return res.status(400).json({
        error: "Batch with same name and year already exists in this city",
      });
    }

    if (!city.slug) {
      return res.status(400).json({ error: "City slug is missing" });
    }

    const baseSlug = generateBatchSlug(city.slug, batch_name, Number(year));

    let finalSlug = baseSlug;
    let counter = 1;

    // Ensure global uniqueness
    while (
      await prisma.batch.findFirst({
        where: { slug: finalSlug },
      })
    ) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const batch = await prisma.batch.create({
      data: {
        batch_name,
        year: Number(year),
        city_id: Number(city_id),
        slug: finalSlug,
      },
    });

    return res.status(201).json({
      message: "Batch created successfully",
      batch,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create batch",
    });
  }
};

// 📋 GET ALL BATCHES (Optional Filters)

export const getAllBatches = async (req: Request, res: Response) => {
  try {
    const { citySlug, year } = req.query;

    const filters: any = {};

    if (citySlug) {
      const city = await prisma.city.findUnique({
        where: { slug: citySlug as string },
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
      include: {
        city: true,
        _count: {
          select: {
            students: true,
            classes: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return res.json(batches);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch batches",
    });
  }
};

//  UPDATE BATCH

export const updateBatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { batch_name, year, city_id } = req.body;

    const existingBatch = await prisma.batch.findUnique({
      where: { id: Number(id) },
    });

    if (!existingBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const finalBatchName = batch_name ?? existingBatch.batch_name;
    const finalYear = year ?? existingBatch.year;
    const finalCityId = city_id ?? existingBatch.city_id;

    // Always fetch fresh city (cleaner & safer)
    const city = await prisma.city.findUnique({
      where: { id: Number(finalCityId) },
    });

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    if (!city.slug) {
      return res.status(400).json({ error: "City slug is missing" });
    }

    // Prevent duplicate batch inside same city
    const duplicate = await prisma.batch.findFirst({
      where: {
        city_id: finalCityId,
        year: finalYear,
        batch_name: finalBatchName,
        NOT: { id: existingBatch.id },
      },
    });

    if (duplicate) {
      return res.status(400).json({
        error: "Batch with same name and year already exists in this city",
      });
    }

    let newSlug = existingBatch.slug;

    // Regenerate slug only if something important changed
    if (batch_name || year || city_id) {
      const baseSlug = generateBatchSlug(
        city.slug,
        finalBatchName,
        finalYear
      );

      newSlug = baseSlug;
      let counter = 1;

      while (
        await prisma.batch.findFirst({
          where: {
            slug: newSlug,
            NOT: { id: existingBatch.id },
          },
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
        slug: newSlug,
      },
    });

    return res.json({
      message: "Batch updated successfully",
      batch: updatedBatch,
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to update batch",
    });
  }
};

//  DELETE BATCH

export const deleteBatch = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const batch = await prisma.batch.findUnique({
      where: { id },
    });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }


    const studentCount = await prisma.student.count({
      where: { batch_id: batch.id },
    });

    if (studentCount > 0) {
      return res.status(400).json({
        error: "Cannot delete batch with active students",
      });
    }

    await prisma.batch.delete({
      where: { id: batch.id },
    });

    return res.json({
      message: "Batch deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete batch",
    });
  }
};

