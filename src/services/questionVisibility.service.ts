import prisma from "../config/prisma";

interface AssignQuestionsInput {
  batchId: number;
  classSlug: string;
  questionIds: number[];
}

export const assignQuestionsToClassService = async ({
  batchId,
  classSlug,
  questionIds,
}: AssignQuestionsInput) => {

  if (!questionIds || questionIds.length === 0) {
    throw new Error("No questions provided");
  }

  const cls = await prisma.class.findFirst({
    where: {
      slug: classSlug,
      batch_id: batchId,
    },
  });

  if (!cls) {
    throw new Error("Class not found in this batch");
  }

  const data = questionIds.map((qid) => ({
    class_id: cls.id,
    question_id: qid,
  }));

  await prisma.questionVisibility.createMany({
    data,
    skipDuplicates: true,
  });

  return { assignedCount: questionIds.length };
};

interface GetAssignedInput {
  batchId: number;
  classSlug: string;
}

export const getAssignedQuestionsOfClassService = async ({
  batchId,
  classSlug,
}: GetAssignedInput) => {

  const cls = await prisma.class.findFirst({
    where: {
      slug: classSlug,
      batch_id: batchId,
    },
  });

  if (!cls) {
    throw new Error("Class not found");
  }

  const assigned = await prisma.questionVisibility.findMany({
    where: {
      class_id: cls.id,
    },
    include: {
      question: {
        include: {
          topic: {
            select: { topic_name: true, slug: true },
          },
        },
      },
    },
    orderBy: {
      assigned_at: "desc",
    },
  });

  return assigned.map((qv) => qv.question);
};

interface RemoveQuestionInput {
  batchId: number;
  classSlug: string;
  questionId: number;
}

export const removeQuestionFromClassService = async ({
  batchId,
  classSlug,
  questionId,
}: RemoveQuestionInput) => {

  const cls = await prisma.class.findFirst({
    where: {
      slug: classSlug,
      batch_id: batchId,
    },
  });

  if (!cls) {
    throw new Error("Class not found");
  }

  await prisma.questionVisibility.deleteMany({
    where: {
      class_id: cls.id,
      question_id: questionId,
    },
  });

  return true;
};