import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import prisma from "../config/prisma";
import csv from "csv-parser";

interface BulkStudentProgressResult {
  message: string;
  summary: {
    totalRows: number;
    progressRecordsCreated: number;
    studentsNotFound: number;
    questionsNotFound: number;
    duplicatesSkipped: number;
  };
  errors: Array<{
    row: number;
    issue: string;
    question?: string;
    enrollment?: string;
  }>;
}

interface StudentProgressCSVRow {
  question_link: string;
  [key: string]: string; // For enrollment columns
}

export const bulkUploadStudentProgress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "CSV file is required");
  }

  const results: BulkStudentProgressResult = {
    message: "Student progress bulk upload completed",
    summary: {
      totalRows: 0,
      progressRecordsCreated: 0,
      studentsNotFound: 0,
      questionsNotFound: 0,
      duplicatesSkipped: 0
    },
    errors: []
  };

  const csvData: StudentProgressCSVRow[] = [];
  
  // Parse CSV
  await new Promise((resolve, reject) => {
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file!.buffer);
    
    bufferStream
      .pipe(csv())
      .on('data', (row: StudentProgressCSVRow) => {
        csvData.push(row);
      })
      .on('end', () => {
        resolve(csvData);
      })
      .on('error', (error: any) => {
        reject(error);
      });
  });

  results.summary.totalRows = csvData.length;

  if (csvData.length === 0) {
    throw new ApiError(400, "CSV file is empty or invalid");
  }

  // Validate CSV structure
  const firstRow = csvData[0];
  if (!firstRow.question_link) {
    throw new ApiError(400, "CSV must contain 'question_link' column");
  }

  // Get all unique enrollment IDs from CSV headers (excluding question_link)
  const enrollmentColumns = Object.keys(firstRow).filter(key => key !== 'question_link');
  
  if (enrollmentColumns.length === 0) {
    throw new ApiError(400, "CSV must contain at least one enrollment column");
  }
  
  // Get all unique question links
  const questionLinks = [...new Set(csvData.map(row => row.question_link?.trim()).filter(Boolean))];
  
  // Pre-fetch all students by enrollment IDs
  const students = await prisma.student.findMany({
    where: {
      enrollment_id: {
        in: enrollmentColumns
      }
    },
    select: {
      id: true,
      enrollment_id: true
    }
  });

  const enrollmentToStudentMap = new Map(
    students.map(student => [student.enrollment_id, student.id])
  );

  // Check for missing enrollment IDs
  enrollmentColumns.forEach(enrollment => {
    if (!enrollmentToStudentMap.has(enrollment)) {
      results.summary.studentsNotFound++;
      results.errors.push({
        row: 0, // Header row issue
        issue: `Student with enrollment ID '${enrollment}' not found in database`,
        enrollment
      });
    }
  });

  // Pre-fetch all questions to avoid N+1 queries
  const questions = await prisma.question.findMany({
    where: {
      question_link: {
        in: questionLinks
      }
    },
    select: {
      id: true,
      question_link: true
    }
  });

  const questionLinkToQuestionMap = new Map(
    questions.map(question => [question.question_link, question.id])
  );

  // Check for missing questions
  questionLinks.forEach(link => {
    if (!questionLinkToQuestionMap.has(link)) {
      results.summary.questionsNotFound++;
      results.errors.push({
        row: 0, // Question not found in database
        issue: `Question with link '${link}' not found in database`,
        question: link
      });
    }
  });

  // Collect all progress records to be created
  const progressRecordsToCreate: Array<{ student_id: number; question_id: number }> = [];
  const existingProgressKeys = new Set<string>();

  // Process each row to collect records
  for (let i = 0; i < csvData.length; i++) {
    const row = csvData[i];
    const rowNum = i + 2; // +2 because header is row 1 and array is 0-indexed

    try {
      const questionLink = row.question_link?.trim();
      if (!questionLink) {
        results.errors.push({
          row: rowNum,
          issue: "Missing question_link in row",
          question: row.question_link
        });
        continue;
      }

      const questionId = questionLinkToQuestionMap.get(questionLink);
      if (!questionId) {
        // Already counted in header validation
        continue;
      }

      // Process each enrollment column
      for (const enrollment of enrollmentColumns) {
        const status = row[enrollment]?.trim();
        
        // Only process "Solved" entries
        if (status !== 'Solved') {
          continue;
        }

        const studentId = enrollmentToStudentMap.get(enrollment);
        if (!studentId) {
          // Already counted in header validation, skip
          continue;
        }

        const progressKey = `${studentId}-${questionId}`;
        
        // Check if we've already added this record in this batch
        if (existingProgressKeys.has(progressKey)) {
          results.summary.duplicatesSkipped++;
          continue;
        }
        
        existingProgressKeys.add(progressKey);
        progressRecordsToCreate.push({
          student_id: studentId,
          question_id: questionId
        });
      }

    } catch (error: any) {
      results.errors.push({
        row: rowNum,
        issue: `Row processing failed: ${error.message}`,
        question: row.question_link
      });
    }
  }

  // Bulk check existing progress records
  if (progressRecordsToCreate.length > 0) {
    const existingRecords = await prisma.studentProgress.findMany({
      where: {
        OR: progressRecordsToCreate.map(record => ({
          student_id: record.student_id,
          question_id: record.question_id
        }))
      },
      select: {
        student_id: true,
        question_id: true
      }
    });

    const existingKeys = new Set(
      existingRecords.map(record => `${record.student_id}-${record.question_id}`)
    );

    // Filter out existing records
    const newRecords = progressRecordsToCreate.filter(record => {
      const key = `${record.student_id}-${record.question_id}`;
      if (existingKeys.has(key)) {
        results.summary.duplicatesSkipped++;
        return false;
      }
      return true;
    });

    // Create new progress records in a transaction
    if (newRecords.length > 0) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.studentProgress.createMany({
            data: newRecords.map(record => ({
              ...record,
              sync_at: new Date()
            }))
          });
        });
        results.summary.progressRecordsCreated = newRecords.length;
      } catch (error: any) {
        results.errors.push({
          row: 0,
          issue: `Transaction failed: ${error.message}`
        });
        throw new ApiError(500, "Failed to create progress records");
      }
    }
  }

  return res.json(results);
});
