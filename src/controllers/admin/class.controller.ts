import { Request, Response } from "express";
import prisma from "../../config/prisma";
import slugify from "slugify";


export const getClassesByTopic = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;

    const topicSlug = req.params.topicSlug;

    if (typeof topicSlug !== "string") {
      return res.status(400).json({ error: "Invalid topic slug" });
    }
    const topic = await prisma.topic.findUnique({
      where: { slug: topicSlug },
    });

    if (!topic) {
      return res.status(404).json({
        error: "Topic not found",
      });
    }

    const classes = await prisma.class.findMany({
      where: {
        topic_id: topic.id,
        batch_id: batch.id,
      },
      include: {
        _count: {
          select: {
            questionVisibility: true,
          },
        },
      },
      orderBy: {
        class_date: "asc",
      },
    });

    const formatted = classes.map((cls) => ({
      id: cls.id,
      class_name: cls.class_name,
      slug: cls.slug,
      description: cls.description,
      pdf_url: cls.pdf_url,
      duration_minutes: cls.duration_minutes,
      class_date: cls.class_date,
      questionCount: cls._count.questionVisibility,
      created_at: cls.created_at,
    }));

    return res.json(formatted);

  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch classes",
    });
  }
};


export const createClassInTopic = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;

    const topicSlug = req.params.topicSlug;
    if (typeof topicSlug !== "string") {
      return res.status(400).json({ error: "Invalid topic slug" });
    }

    const {
      class_name,
      description,
      pdf_url,
      duration_minutes,
      class_date,
    } = req.body;

    if (!class_name) {
      return res.status(400).json({
        error: "Class name is required",
      });
    }

    // 1️⃣ Find Topic
    const topic = await prisma.topic.findUnique({
      where: { slug: topicSlug },
    });

    if (!topic) {
      return res.status(404).json({
        error: "Topic not found",
      });
    }

    // 2️⃣ Check duplicate class name inside same topic + batch
    const duplicateName = await prisma.class.findFirst({
      where: {
        topic_id: topic.id,
        batch_id: batch.id,
        class_name,
      },
    });

    if (duplicateName) {
      return res.status(400).json({
        error: "Class with same name already exists in this topic",
      });
    }

    // 3️⃣ Generate base slug
    const baseSlug = slugify(class_name, {
      lower: true,
      strict: true,
    });

    let finalSlug = baseSlug;
    let counter = 1;

    // Ensure slug unique inside batch
    while (
      await prisma.class.findFirst({
        where: {
          batch_id: batch.id,
          slug: finalSlug,
        },
      })
    ) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // 4️⃣ Create Class
    const newClass = await prisma.class.create({
      data: {
        class_name,
        slug: finalSlug,
        description,
        pdf_url,
        duration_minutes,
        class_date: class_date ? new Date(class_date) : null,
        topic_id: topic.id,
        batch_id: batch.id,
      },
    });

    return res.status(201).json({
      message: "Class created successfully",
      class: newClass,
    });

  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to create class",
    });
  }
};

export const getClassDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;

    const classSlug = req.params.classSlug;

    if (typeof classSlug !== "string") {
      return res.status(400).json({ error: "Invalid class slug" });
    }

    // 1️⃣ Find class inside this batch
    const cls = await prisma.class.findFirst({
      where: {
        slug: classSlug,
        batch_id: batch.id,
      },
      include: {
        topic: {
          select: {
            id: true,
            topic_name: true,
            slug: true,
          },
        },
        questionVisibility: {
          include: {
            question: {
              select: {
                id: true,
                question_name: true,
                level: true,
                platform: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!cls) {
      return res.status(404).json({
        error: "Class not found in this batch",
      });
    }

    const formatted = {
      id: cls.id,
      class_name: cls.class_name,
      slug: cls.slug,
      description: cls.description,
      pdf_url: cls.pdf_url,
      duration_minutes: cls.duration_minutes,
      class_date: cls.class_date,
      created_at: cls.created_at,
      topic: cls.topic,
      questions: cls.questionVisibility.map((qv) => qv.question),
      questionCount: cls.questionVisibility.length,
    };

    return res.json(formatted);

  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch class details",
    });
  }
};