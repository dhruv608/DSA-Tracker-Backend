import { Request, Response } from "express";
import { getRecentQuestionsService } from "../services/recentQuestions.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const getRecentQuestions = asyncHandler(async (req: Request, res: Response) => {
          try {
            // Get batch info from middleware (extractStudentInfo)
            const batchId = (req as any).batchId;
            const { date } = req.query;

            if (!batchId) {
              throw new ApiError(401, "Student authentication required", [], "UNAUTHORIZED");
            }

            // Validate date parameter (format: YYYY-MM-DD)
            let dateParam: string | undefined;
            if (date) {
              const dateStr = date as string;
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
              if (!dateRegex.test(dateStr)) {
                throw new ApiError(400, "Date parameter must be in YYYY-MM-DD format", [], "INVALID_INPUT");
              }
              
              // Validate if it's a valid date
              const parsedDate = new Date(dateStr);
              if (isNaN(parsedDate.getTime())) {
                throw new ApiError(400, "Invalid date provided", [], "INVALID_INPUT");
              }
              
              dateParam = dateStr;
            }

            const questions = await getRecentQuestionsService({
              batchId,
              date: dateParam
            });

            return res.json({
              questions,
              total: questions.length
            });

          } catch (error: any) {
    if (error instanceof ApiError) throw error;
            throw new ApiError(500, error.message || "Failed to fetch recent questions", [], "INTERNAL_SERVER_ERROR");
          }
        });
