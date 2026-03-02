import { Request, Response } from "express";
import prisma from "../../config/prisma";
import slugify from "slugify";

// Create Topic
 "slugify";

export const createTopic = async (
  req: Request,
  res: Response
) => {
  try {
    const { topic_name } = req.body;

    if (!topic_name) {
      return res.status(400).json({
        error: "Topic name is required",
      });
    }

    const baseSlug = slugify(topic_name, {
      lower: true,
      strict: true,
    });

    let finalSlug = baseSlug;
    let counter = 1;

    // Ensure global unique slug
    while (
      await prisma.topic.findUnique({
        where: { slug: finalSlug },
      })
    ) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const topic = await prisma.topic.create({
      data: {
        topic_name,
        slug: finalSlug,
      },
    });

    return res.status(201).json({
      message: "Topic created successfully",
      topic,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Topic already exists",
      });
    }

    return res.status(500).json({
      error: "Failed to create topic",
    });
  }
};

// Get All Topics
export const getAllTopics = async (_req: Request, res: Response) => {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { created_at: "desc" },
    });

    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch topics" });
  }
};

export const getTopicsForBatch = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;

    const topics = await prisma.topic.findMany({
      include: {
        classes: {
          where: {
            batch_id: batch.id,
          },
          select: { id: true },
        },
        questions: {
          select: { id: true },
        },
      },
      orderBy: { topic_name: "asc" },
    });

    const formatted = topics.map((topic) => ({
      id: topic.id,
      topic_name: topic.topic_name,
      slug: topic.slug,
      classCount: topic.classes.length,
      questionCount: topic.questions.length,
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch topics for batch",
    });
  }
};