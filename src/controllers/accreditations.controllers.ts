import { RequestHandler } from "express";
import { ResponseData } from "../types/ResponseData";
import prisma from "../prisma";

export const getAllAccreditationsController: RequestHandler = async (req, res) => {
  const accreditations = await prisma.tourAccess.findMany({
    where: {
      OR: [
        {
          expires_at: {
            lte: new Date(), // Fetch only expired accreditations
          }
        },
        {
          expired: true // Fetch only expired accreditations
        }
      ]
    }
  })

  return res.status(200).json({
    ok: true,
    message: "Accreditations fetched successfully",
    data: accreditations,
  } as ResponseData)
}