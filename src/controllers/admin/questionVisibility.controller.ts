import { Request, Response } from "express";
import { assignQuestionsToClassService, getAssignedQuestionsOfClassService, removeQuestionFromClassService } from "../../services/questionVisibility.service";


export const assignQuestionsToClass = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;
    const classSlug = req.params.classSlug;

    if (typeof classSlug !== "string") {
      return res.status(400).json({
        error: "Invalid class slug",
      });
    }
    const { question_ids } = req.body;

    const result = await assignQuestionsToClassService({
      batchId: batch.id,
      classSlug,
      questionIds: question_ids,
    });

    return res.json({
      message: "Questions assigned successfully",
      ...result,
    });

  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getAssignedQuestionsOfClass = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;
    const classSlug = req.params.classSlug;

    if (typeof classSlug !== "string") {
      return res.status(400).json({
        error: "Invalid class slug",
      });
    }

    const questions = await getAssignedQuestionsOfClassService({
      batchId: batch.id,
      classSlug,
    });

    return res.json(questions);

  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};


export const removeQuestionFromClass = async (
  req: Request,
  res: Response
) => {
  try {
    const batch = (req as any).batch;
    const classSlug = req.params.classSlug;

    if (typeof classSlug !== "string") {
      return res.status(400).json({
        error: "Invalid class slug",
      });
    }
    const { questionId } = req.params;

    await removeQuestionFromClassService({
      batchId: batch.id,
      classSlug,
      questionId: Number(questionId),
    });

    return res.json({
      message: "Question removed from class successfully",
    });

  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};