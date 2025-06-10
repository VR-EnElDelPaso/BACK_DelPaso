import { RequestHandler } from "express";
import { ResponseData } from "../types/ResponseData";
import prisma from "../prisma";

export const getAllAccreditationsController: RequestHandler = async (req, res) => {
  prisma.tourAccess.findMany({
    where: {
      
    }
  return res.status(200).json({
    ok: true,
    message: "Accreditations fetched successfully",
  } as ResponseData)
}