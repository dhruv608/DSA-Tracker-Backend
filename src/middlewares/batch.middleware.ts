import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const resolveBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { batchSlug } = req.params;

  if (!batchSlug || Array.isArray(batchSlug)) {
    return res.status(400).json({ error: "Invalid batch slug" });
  }

  const batch = await prisma.batch.findUnique({
    where: { slug: batchSlug },
  });

  if (!batch) {
    return res.status(404).json({ error: "Batch not found" });
  }

  (req as any).batch = batch;

  next();
};