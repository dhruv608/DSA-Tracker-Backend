import slugify from "slugify";
import prisma from "../config/prisma";


interface CreateTopicInput {
  topic_name: string;
}

export const createTopicService = async ({
  topic_name,
}: CreateTopicInput) => {

  if (!topic_name) {
    throw new Error("Topic name is required");
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

  try {
    const topic = await prisma.topic.create({
      data: {
        topic_name,
        slug: finalSlug,
      },
    });

    return topic;

  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Topic already exists");
    }

    throw new Error("Failed to create topic");
  }
};


export const getAllTopicsService = async () => {

  const topics = await prisma.topic.findMany({
    orderBy: { created_at: "desc" },
  });

  return topics;
};

interface GetTopicsForBatchInput {
  batchId: number;
}

export const getTopicsForBatchService = async ({
  batchId,
}: GetTopicsForBatchInput) => {

  const topics = await prisma.topic.findMany({
    include: {
      classes: {
        where: {
          batch_id: batchId
        },
        include: {
          questionVisibility: {
            include: {
              question: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      }
    }
  });

  const formatted = topics.map(topic => {

    const uniqueQuestions = new Set<number>();

    topic.classes.forEach(cls => {
      cls.questionVisibility.forEach(qv => {
        uniqueQuestions.add(qv.question.id);
      });
    });

    return {
      id: topic.id,
      topic_name: topic.topic_name,
      slug: topic.slug,
      classCount: topic.classes.length,
      questionCount: uniqueQuestions.size
    };
  });

  return formatted;
};

interface UpdateTopicInput {
  id: number;
  topic_name: string;
}

export const updateTopicService = async ({
  id,
  topic_name,
}: UpdateTopicInput) => {

  if (!topic_name) {
    throw new Error("Topic name is required");
  }

  const existingTopic = await prisma.topic.findUnique({
    where: { id },
  });

  if (!existingTopic) {
    throw new Error("Topic not found");
  }

  const duplicate = await prisma.topic.findUnique({
    where: { topic_name },
  });

  if (duplicate && duplicate.id !== existingTopic.id) {
    throw new Error("Topic already exists");
  }

  const baseSlug = slugify(topic_name, {
    lower: true,
    strict: true,
  });

  let finalSlug = baseSlug;
  let counter = 1;

  while (
    await prisma.topic.findFirst({
      where: {
        slug: finalSlug,
        NOT: { id: existingTopic.id },
      },
    })
  ) {
    finalSlug = `${baseSlug}-${counter++}`;
  }

  const updatedTopic = await prisma.topic.update({
    where: { id },
    data: {
      topic_name,
      slug: finalSlug,
    },
  });

  return updatedTopic;
};

interface DeleteTopicInput {
  id: number;
}

export const deleteTopicService = async ({ id }: DeleteTopicInput) => {

  const topic = await prisma.topic.findUnique({
    where: { id },
  });

  if (!topic) {
    throw new Error("Topic not found");
  }

  const classCount = await prisma.class.count({
    where: { topic_id: id },
  });

  if (classCount > 0) {
    throw new Error("Cannot delete topic with existing classes");
  }

  const questionCount = await prisma.question.count({
    where: { topic_id: id },
  });

  if (questionCount > 0) {
    throw new Error("Cannot delete topic with existing questions");
  }

  await prisma.topic.delete({
    where: { id },
  });

  return true;
};

interface GetTopicsWithBatchProgressInput {
  studentId: number;
  batchId: number;
}

export const getTopicsWithBatchProgressService = async ({
  studentId,
  batchId,
}: GetTopicsWithBatchProgressInput) => {
  
  // Get all topics with batch-specific classes and question counts
  const topics = await prisma.topic.findMany({
    include: {
      classes: {
        where: {
          batch_id: batchId
        },
        include: {
          questionVisibility: {
            include: {
              question: {
                select: {
                  id: true,
                  topic_id: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'asc' }
      }
    }
  });

  // Get all question IDs assigned to this batch
  const assignedQuestionIds = new Set<number>();
  topics.forEach((topic: any) => {
    topic.classes.forEach((cls: any) => {
      cls.questionVisibility.forEach((qv: any) => {
        assignedQuestionIds.add(qv.question.id);
      });
    });
  });

  // Get student's solved questions for this batch only
  const studentProgress = await prisma.studentProgress.findMany({
    where: {
      student_id: studentId,
      question_id: { in: Array.from(assignedQuestionIds) }
    },
    include: {
      question: {
        select: {
          topic_id: true
        }
      }
    }
  });

  // Group solved questions by topic
  const solvedByTopic = new Map<number, Set<number>>();
  studentProgress.forEach(progress => {
    const topicId = progress.question.topic_id;
    if (!solvedByTopic.has(topicId)) {
      solvedByTopic.set(topicId, new Set());
    }
    solvedByTopic.get(topicId)!.add(progress.question_id);
  });

  // Format response
  const formattedTopics = topics.map((topic: any) => {
    // Count unique questions assigned to this batch for this topic
    const assignedQuestions = new Set<number>();
    
    topic.classes.forEach((cls: any) => {
      cls.questionVisibility.forEach((qv: any) => {
        // Only count questions that belong to this topic
        if (qv.question.topic_id === topic.id) {
          assignedQuestions.add(qv.question.id);
        }
      });
    });

    // Get solved questions for this topic
    const solvedQuestions = solvedByTopic.get(topic.id) || new Set();

    return {
      id: topic.id,
      topic_name: topic.topic_name,
      slug: topic.slug,
      batchSpecificData: {
        totalClasses: topic.classes.length,
        totalQuestions: assignedQuestions.size,
        solvedQuestions: solvedQuestions.size
      }
    };
  });

  return formattedTopics;
};

// Student-specific service - get topic overview with classes summary
interface GetTopicOverviewWithClassesSummaryInput {
  studentId: number;
  batchId: number;
  topicSlug: string;
}

export const getTopicOverviewWithClassesSummaryService = async ({
  studentId,
  batchId,
  topicSlug,
}: GetTopicOverviewWithClassesSummaryInput) => {
  
  // Get topic with batch-specific classes
  const topic = await prisma.topic.findFirst({
    where: { slug: topicSlug },
    include: {
      classes: {
        where: {
          batch_id: batchId
        },
        include: {
          questionVisibility: {
            include: {
              question: {
                select: {
                  id: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'asc' }
      }
    }
  });

  if (!topic) {
    throw new Error("Topic not found");
  }

  // Get all question IDs assigned to this batch for this topic
  const assignedQuestionIds = new Set<number>();
  topic.classes.forEach((cls: any) => {
    cls.questionVisibility.forEach((qv: any) => {
      assignedQuestionIds.add(qv.question.id);
    });
  });

  // Get student's solved questions for this batch only
  const studentProgress = await prisma.studentProgress.findMany({
    where: {
      student_id: studentId,
      question_id: { in: Array.from(assignedQuestionIds) }
    },
    include: {
      question: {
        select: {
          id: true
        }
      }
    }
  });

  // Create a Set of solved question IDs for quick lookup
  const solvedQuestionIds = new Set(
    studentProgress.map(progress => progress.question_id)
  );

  // Format classes with summary data
  const classesSummary = topic.classes.map((cls: any) => {
    // Count total questions for this class
    const totalQuestions = cls.questionVisibility.length;
    
    // Count solved questions for this class
    const solvedQuestions = cls.questionVisibility.filter((qv: any) => 
      solvedQuestionIds.has(qv.question.id)
    ).length;

    return {
      id: cls.id,
      class_name: cls.class_name,
      slug: cls.slug,
      duration_minutes: cls.duration_minutes,
      description: cls.description,
      totalQuestions,
      solvedQuestions
    };
  });

  // Calculate overall topic progress
  const totalTopicQuestions = classesSummary.reduce((sum: number, cls: any) => sum + cls.totalQuestions, 0);
  const totalSolvedQuestions = classesSummary.reduce((sum: number, cls: any) => sum + cls.solvedQuestions, 0);

  return {
    id: (topic as any).id,
    topic_name: (topic as any).topic_name,
    slug: (topic as any).slug,
    description: (topic as any).description || null,
    classes: classesSummary,
    overallProgress: {
      totalClasses: classesSummary.length,
      totalQuestions: totalTopicQuestions,
      solvedQuestions: totalSolvedQuestions
    }
  };
};