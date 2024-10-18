import { RequestHandler, Request, Response } from "express";
import { ResponseData } from '../types/ResponseData';
import prisma from '../prisma';
import { z } from "zod";

const IdsSchema = z.array(z.string());

export const getToursFromIds: RequestHandler = async (req: Request, res: Response) => {

  const result = IdsSchema.safeParse(req.body.ids);

  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid ids',
    } as ResponseData);
  }

  const ids = result.data;

  try {
    const foundTours = await prisma.tour.findMany({
      where: { id: { in: ids } }
    });
    return res.status(200).json({
      ok: true,
      message: 'Tours fetched successfully',
      data: foundTours,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error fetching tours',
    } as ResponseData);
  }
}

export const getTourSuggestions: RequestHandler = async (req: Request, res: Response) => {
  const { excludedIds, } = req.body;
  const take = parseInt(req.query.take as string) || 10;

  const result = IdsSchema.safeParse(excludedIds);

  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid excludedIds',
    } as ResponseData);
  }

  const ids = result.data;

  try {
    const foundTours = await prisma.tour.findMany({
      where: { id: { notIn: ids } },
      take
    });
    return res.status(200).json({
      ok: true,
      message: 'Tours suggestions fetched successfully',
      data: foundTours,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error fetching tours',
    } as ResponseData);
  }
}