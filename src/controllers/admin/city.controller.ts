import { Request, Response } from "express";
import prisma from "../../config/prisma";
import { generateSlug } from "../../utils/slugify";


// Create City
// ================= CREATE CITY =================
export const createCity = async (req: Request, res: Response) => {
  try {
    const { city_name } = req.body;

    if (!city_name) {
      return res.status(400).json({ error: "City name is required" });
    }
    const existingName = await prisma.city.findUnique({
      where: { city_name }
    });

    if (existingName) {
      return res.status(400).json({ error: "City already exists" });
    }
    const baseSlug = generateSlug(city_name);

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.city.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const city = await prisma.city.create({
      data: {
        city_name,
        slug,
      },
    });

    res.status(201).json({
      message: "City created successfully",
      city,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create city" });
  }
};

// Get All Cities (for dropdown)
export const getAllCities = async (_req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { created_at: "desc" },
    });

    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
};
// delete city 

export const updateCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { city_name } = req.body;

    if (!city_name) {
      return res.status(400).json({ error: "City name is required" });
    }

    const existingCity = await prisma.city.findUnique({
      where: { id:Number(id) }
    });

    if (!existingCity) {
      return res.status(404).json({ error: "City not found" });
    }

    // Check duplicate city name
    const duplicateName = await prisma.city.findUnique({
      where: { city_name }
    });

    if (duplicateName && duplicateName.id !== existingCity.id) {
      return res.status(400).json({ error: "City name already in use" });
    }

       // regenerate slug
    const baseSlug = generateSlug(city_name);
    let newSlug = baseSlug;
    let counter = 1;

    while (
      await prisma.city.findFirst({
        where: {
          slug: newSlug,
          NOT: { id: existingCity.id }
        }
      })
    ) {
      newSlug = `${baseSlug}-${counter++}`;
    }

    const updatedCity = await prisma.city.update({
      where: { id: existingCity.id },
      data: {
        city_name,
        slug: newSlug
      }
    });

    return res.json({
      message: "City updated successfully",
      city: updatedCity
    });

  } catch (error) {
    return res.status(500).json({ error: "Failed to update city" });
  }
};

export const deleteCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const city = await prisma.city.findUnique({
      where: { id:Number(id) }
    });

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    const batchCount = await prisma.batch.count({
      where: { city_id: city.id }
    });

    if (batchCount > 0) {
      return res.status(400).json({
        error: "Cannot delete city with active batches"
      });
    }
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    const studentCount = await prisma.student.count({
      where: { city_id: city.id }
    });

    if (studentCount > 0) {
      return res.status(400).json({
        error: "Cannot delete city with active students"
      });
    }
    await prisma.city.delete({
      where: { id:city.id }
    });

    return res.json({
      message: "City deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({ error: "Failed to delete city" });
  }
};




