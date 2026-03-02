import { Request, Response } from "express";
import prisma from "../../config/prisma";

export const getAllQuestions = async (
  req: Request,
  res: Response
) => {
  try {
    const { topicSlug, level, platform, type, search } = req.query;

    const where: any = {};

    // 🔎 Filter by topic
    if (typeof topicSlug === "string") {
      const topic = await prisma.topic.findUnique({
        where: { slug: topicSlug },
      });

      if (!topic) {
        return res.status(404).json({
          error: "Topic not found",
        });
      }

      where.topic_id = topic.id;
    }

    // 🔎 Filter by level
    if (typeof level === "string") {
      where.level = level;
    }

    // 🔎 Filter by platform
    if (typeof platform === "string") {
      where.platform = platform;
    }

    // 🔎 Filter by type
    if (typeof type === "string") {
      where.type = type;
    }

    // 🔎 Search by question name
    if (typeof search === "string") {
      where.question_name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        topic: {
          select: {
            topic_name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return res.json(questions);

  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch questions",
    });
  }
};


export const assignQuestions = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;
    const { classSlug } = req.params;
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        error: "questionIds must be a non-empty array",
      });
    }

    if (typeof classSlug !== "string") {
      return res.status(400).json({
        error: "Invalid class slug",
      });
    }

    // 🔍 Find class in this batch
    const cls = await prisma.class.findFirst({
      where: {
        slug: classSlug,
        batch_id: batch.id,
      },
    });

    if (!cls) {
      return res.status(404).json({
        error: "Class not found in this batch",
      });
    }

    // 🔍 Validate question IDs exist
    const existingQuestions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
      },
      select: { id: true },
    });

    const validIds = existingQuestions.map(q => q.id);

    // 📝 Prepare data for insertion
    const data = validIds.map((questionId) => ({
      class_id: cls.id,
      question_id: questionId,
    }));

    // 🚀 Insert (skip duplicates automatically)
    await prisma.questionVisibility.createMany({
      data,
      skipDuplicates: true,
    });

    return res.json({
      message: "Questions assigned successfully",
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to assign questions",
    });
  }
};


export const removeQuestionFromClass = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;
    const { classSlug, questionId } = req.params;

    if (typeof classSlug !== "string") {
      return res.status(400).json({
        error: "Invalid class slug",
      });
    }

    const questionIdNumber = Number(questionId);

    if (isNaN(questionIdNumber)) {
      return res.status(400).json({
        error: "Invalid question ID",
      });
    }

    // 🔍 Find class inside this batch
    const cls = await prisma.class.findFirst({
      where: {
        slug: classSlug,
        batch_id: batch.id,
      },
    });

    if (!cls) {
      return res.status(404).json({
        error: "Class not found in this batch",
      });
    }

    // 🔍 Delete relation
    const deleted = await prisma.questionVisibility.deleteMany({
      where: {
        class_id: cls.id,
        question_id: questionIdNumber,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        error: "Question not assigned to this class",
      });
    }

    return res.json({
      message: "Question removed successfully",
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to remove question",
    });
  }
};