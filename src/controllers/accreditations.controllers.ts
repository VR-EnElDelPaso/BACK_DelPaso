import { RequestHandler } from "express";
import { ResponseData } from "../types/ResponseData";

export const getAllAccreditationsController: RequestHandler = async (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "Accreditations fetched successfully",
  } as ResponseData)
}