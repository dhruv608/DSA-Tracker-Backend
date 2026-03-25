import { Request, Response } from "express";
import prisma from "../config/prisma";

export const checkUsernameAvailability = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: "Username parameter is required" });
    }

    // Trim whitespace
    const trimmedUsername = username.trim();

    // Don't check if username is too short
    if (trimmedUsername.length < 3) {
      return res.json({ available: false });
    }

    // Check if username already exists
    const existingStudent = await prisma.student.findUnique({
      where: { username: trimmedUsername },
      select: { id: true }
    });

    res.json({ 
      available: !existingStudent 
    });
  } catch (error) {
    console.error("Error checking username availability:", error);
    res.status(500).json({ error: "Failed to check username availability" });
  }
};

export const updateUsername = async (req: Request, res: Response) => {
  try {
    console.log('Username update request received');
    console.log('User from token:', req.user);
    console.log('Student ID:', (req as any).studentId);
    
    const studentId = req.user?.id;
    const { username } = req.body;

    console.log('Request body:', { username });

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    if (!studentId) {
      console.log('No student ID found in request');
      return res.status(401).json({ error: "Student not authenticated" });
    }

    // Check if username is already taken
    const existingStudent = await prisma.student.findFirst({
      where: {
        username: username,
        id: { not: studentId } // Exclude current student
      }
    });

    if (existingStudent) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Update username
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { username },
      select: {
        id: true,
        username: true,
        name: true,
        email: true
      }
    });

    console.log('Username updated successfully:', updated);

    res.json({
      message: "Username updated successfully",
      user: updated,
    });
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ error: "Failed to update username" });
  }
};
