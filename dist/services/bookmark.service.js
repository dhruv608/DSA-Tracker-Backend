"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookmarkService = exports.updateBookmarkService = exports.addBookmarkService = exports.getBookmarksService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const ApiError_1 = require("../utils/ApiError");
const errorMapper_1 = require("../utils/errorMapper");
// ==============================
// GET ALL BOOKMARKS WITH PAGINATION
// ==============================
const getBookmarksService = async (studentId, options) => {
    try {
        const { page = 1, limit = 10, sort = 'recent', filter = 'all' } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        // Build where clause for filtering
        let whereClause = { student_id: studentId };
        // Add solved status filter
        if (filter === 'solved') {
            whereClause.question = {
                progress: {
                    some: {
                        student_id: studentId
                    }
                }
            };
        }
        else if (filter === 'unsolved') {
            whereClause.question = {
                progress: {
                    none: {
                        student_id: studentId
                    }
                }
            };
        }
        // Build order clause for sorting
        let orderBy = {};
        switch (sort) {
            case 'recent':
                orderBy = { created_at: 'desc' };
                break;
            case 'old':
                orderBy = { created_at: 'asc' };
                break;
            case 'solved':
                orderBy = [
                    {
                        question: {
                            progress: {
                                some: {
                                    student_id: studentId
                                }
                            }
                        }
                    },
                    { created_at: 'desc' }
                ];
                break;
            case 'unsolved':
                orderBy = [
                    {
                        question: {
                            progress: {
                                none: {
                                    student_id: studentId
                                }
                            }
                        }
                    },
                    { created_at: 'desc' }
                ];
                break;
            default:
                orderBy = { created_at: 'desc' };
        }
        const [bookmarks, totalCount] = await Promise.all([
            // Get bookmarks with pagination
            prisma_1.default.bookmark.findMany({
                where: whereClause,
                include: {
                    question: {
                        select: {
                            id: true,
                            question_name: true,
                            question_link: true,
                            platform: true,
                            level: true,
                            type: true,
                            progress: {
                                where: {
                                    student_id: studentId
                                },
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                },
                orderBy,
                skip,
                take
            }),
            // Get total count for pagination
            prisma_1.default.bookmark.count({ where: whereClause })
        ]);
        // Format bookmarks with solved status
        const formattedBookmarks = bookmarks.map(bookmark => ({
            id: bookmark.id,
            question: bookmark.question,
            description: bookmark.description,
            created_at: bookmark.created_at,
            isSolved: bookmark.question.progress.length > 0
        }));
        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / take);
        const hasNextPage = Number(page) < totalPages;
        const hasPreviousPage = Number(page) > 1;
        return {
            bookmarks: formattedBookmarks,
            pagination: {
                page: Number(page),
                limit: take,
                total: totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage
            }
        };
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Student not found");
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to fetch bookmarks");
    }
};
exports.getBookmarksService = getBookmarksService;
// ==============================
// ADD BOOKMARK
// ==============================
const addBookmarkService = async (studentId, questionId, description) => {
    try {
        // Check if student exists
        const student = await prisma_1.default.student.findUnique({
            where: { id: studentId }
        });
        if (!student) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Student not found");
        }
        // Check if question exists
        const question = await prisma_1.default.question.findUnique({
            where: { id: questionId }
        });
        if (!question) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Question not found");
        }
        // Check if already bookmarked
        const existingBookmark = await prisma_1.default.bookmark.findUnique({
            where: {
                student_id_question_id: {
                    student_id: studentId,
                    question_id: questionId
                }
            }
        });
        if (existingBookmark) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Question already bookmarked");
        }
        // Create bookmark
        const bookmark = await prisma_1.default.bookmark.create({
            data: {
                student_id: studentId,
                question_id: questionId,
                description: description || null
            },
            select: {
                id: true,
                question_id: true,
                description: true,
                created_at: true
            }
        });
        return bookmark;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.CONFLICT, "Question already bookmarked");
            }
            if (error.code === "P2003") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.BAD_REQUEST, "Invalid student or question reference");
            }
            if (error.code === "P2025") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Student or question not found");
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to add bookmark");
    }
};
exports.addBookmarkService = addBookmarkService;
// ==============================
// UPDATE BOOKMARK DESCRIPTION
// ==============================
const updateBookmarkService = async (studentId, questionId, description) => {
    try {
        // Check if bookmark exists
        const existingBookmark = await prisma_1.default.bookmark.findUnique({
            where: {
                student_id_question_id: {
                    student_id: studentId,
                    question_id: questionId
                }
            }
        });
        if (!existingBookmark) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Bookmark not found");
        }
        // Update bookmark
        const bookmark = await prisma_1.default.bookmark.update({
            where: {
                student_id_question_id: {
                    student_id: studentId,
                    question_id: questionId
                }
            },
            data: {
                description,
                updated_at: new Date()
            },
            select: {
                id: true,
                question_id: true,
                description: true,
                created_at: true,
                updated_at: true
            }
        });
        return bookmark;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Bookmark not found");
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to update bookmark");
    }
};
exports.updateBookmarkService = updateBookmarkService;
// ==============================
// DELETE BOOKMARK
// ==============================
const deleteBookmarkService = async (studentId, questionId) => {
    try {
        // Check if bookmark exists
        const existingBookmark = await prisma_1.default.bookmark.findUnique({
            where: {
                student_id_question_id: {
                    student_id: studentId,
                    question_id: questionId
                }
            }
        });
        if (!existingBookmark) {
            throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Bookmark not found");
        }
        // Delete bookmark
        await prisma_1.default.bookmark.delete({
            where: {
                student_id_question_id: {
                    student_id: studentId,
                    question_id: questionId
                }
            }
        });
        return true;
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.NOT_FOUND, "Bookmark not found");
            }
        }
        throw new ApiError_1.ApiError(errorMapper_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to delete bookmark");
    }
};
exports.deleteBookmarkService = deleteBookmarkService;
