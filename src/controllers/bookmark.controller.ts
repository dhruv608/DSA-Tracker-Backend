import { Request, Response } from "express";
import {
  getBookmarksService,
  addBookmarkService,
  updateBookmarkService,
  deleteBookmarkService,
} from "../services/bookmark.service";
import { ApiError } from "../utils/ApiError";

// ==============================
// GET ALL BOOKMARKS
// ==============================

export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).student.id;
    const { page = 1, limit = 10, sort = 'recent', filter = 'all' } = req.query;

    // Validate query parameters
    const validSorts = ['recent', 'old', 'solved', 'unsolved'];
    const validFilters = ['all', 'solved', 'unsolved'];

    if (!validSorts.includes(sort as string)) {
      throw new ApiError(400, "Invalid sort parameter");
    }

    if (!validFilters.includes(filter as string)) {
      throw new ApiError(400, "Invalid filter parameter");
    }

    const result = await getBookmarksService(studentId, {
      page: Number(page),
      limit: Number(limit),
      sort: sort as 'recent' | 'old' | 'solved' | 'unsolved',
      filter: filter as 'all' | 'solved' | 'unsolved'
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || "SERVER_ERROR",
          message: error.message,
          details: error.errors || []
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch bookmarks",
          details: []
        }
      });
    }
  }
};

// ==============================
// ADD BOOKMARK
// ==============================

export const addBookmark = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).student.id;
    const { question_id, description } = req.body;

    // Validation
    if (!question_id) {
      throw new ApiError(400, "Question ID is required", [], "VALIDATION_ERROR");
    }

    if (typeof question_id !== 'number') {
      throw new ApiError(400, "Question ID must be a number", [], "VALIDATION_ERROR");
    }

    const bookmark = await addBookmarkService(studentId, question_id, description);

    res.status(201).json({
      success: true,
      data: bookmark
    });

  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || "SERVER_ERROR",
          message: error.message,
          details: error.errors || []
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to add bookmark",
          details: []
        }
      });
    }
  }
};

// ==============================
// UPDATE BOOKMARK
// ==============================

export const updateBookmark = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).student.id;
    const { questionId } = req.params;
    const { description } = req.body;

    // Validation
    if (!questionId) {
      throw new ApiError(400, "Question ID is required", [], "VALIDATION_ERROR");
    }
    if (typeof description !== 'string') {
      throw new ApiError(400, "Description must be a string", [], "VALIDATION_ERROR");
    }

    const bookmark = await updateBookmarkService(studentId, Number(questionId), description);

    res.status(200).json({
      success: true,
      data: bookmark
    });

  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || "SERVER_ERROR",
          message: error.message,
          details: error.errors || []
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to update bookmark",
          details: []
        }
      });
    }
  }
};

// ==============================
// DELETE BOOKMARK
// ==============================

export const deleteBookmark = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).student.id;
    const { questionId } = req.params;

    // Validation
    if (!questionId) {
      throw new ApiError(400, "Question ID is required", [], "VALIDATION_ERROR");
    }

    await deleteBookmarkService(studentId, Number(questionId));

    res.status(200).json({
      success: true,
      message: "Bookmark removed successfully"
    });

  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || "SERVER_ERROR",
          message: error.message,
          details: error.errors || []
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to delete bookmark",
          details: []
        }
      });
    }
  }
};
