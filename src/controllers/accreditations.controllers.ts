import { RequestHandler } from "express";
import { ResponseData } from "../types/ResponseData";
import prisma from "../prisma";
import { Role } from "@prisma/client";

export const getAllAccreditationsController: RequestHandler = async (req, res) => {
  const accreditations = await prisma.tourAccess.findMany({
    where: {
      AND: [
        {
          OR: [
            { expires_at: { lte: new Date() } },
            { expired: true },
          ],
        },
        {
          user: {
            role: Role.STUDENT,
          },
        },
        {
          tour: {
            is_accreditable: true,
          }
        }
      ],
    },
    select: {
      id: true,
      tour: {
        select: {
          id: true,
          name: true,
          accreditable_hours: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          first_lastname: true,
          second_lastname: true,
          account_number: true,
        },
      },
      expires_at: true,
    },
  })


  return res.status(200).json({
    ok: true,
    message: "Accreditations fetched successfullyss",
    data: accreditations,
  } as ResponseData)
}