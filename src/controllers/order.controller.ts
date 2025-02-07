import { Request, RequestHandler, Response } from "express";
import { z } from "zod";
import { invalidBodyResponse, notFoundResponse, operationErrorResponse, validateIdAndRespond } from "../utils/controllerUtils";
import prisma from "../prisma";
import { ResponseData } from "../types/ResponseData";
import UserWithoutPassword from "../types/auth/UserWithoutPassword";
import { OrderStatus } from "@prisma/client";

// ----[ Schemas ]----

const createOneOrderBodySchema = z.object({
  tour_ids: z.array(z.string().uuid()).min(1),
});

const PatchOrderSchema = z.object({

  status: z.enum([...Object.values(OrderStatus)] as [OrderStatus])
});


// ----[ CRUD ]----

// get one
export const getOneOrderController: RequestHandler = async (req: Request, res: Response) => {
  try {
    const orderId = validateIdAndRespond(res, req.params.order_id);
    if (!orderId) return;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        tours: true,
        payment: true,
        preference: true,
      }
    });
    if (!order) return notFoundResponse(res, "Order");

    return res.status(200).json({
      ok: true,
      message: "Order fetched successfully",
      data: order,
    } as ResponseData);
  } catch (error) {
    console.error("Error fetching order:", error);
    return operationErrorResponse(res);
  }
}

// create one
export const createOneOrderController: RequestHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as UserWithoutPassword)?.id;

    // Validate body
    const bodyValidation = createOneOrderBodySchema.safeParse(req.body);
    if (!bodyValidation.success) return invalidBodyResponse(res, bodyValidation.error);

    // validate tour_ids
    const tour_ids = bodyValidation.data.tour_ids;
    const tours = await prisma.tour.findMany({ where: { id: { in: tour_ids } } });
    if (tours.length !== tour_ids.length)
      return res.status(400).json({
        ok: false,
        message: "Some tours were not found",
      } as ResponseData);

    // Create order
    const total = tours.reduce((acc, tour) => acc + tour.price.toNumber(), 0);
    const createdOrder = await prisma.order.create({
      data: {
        user_id: userId,
        total,
        tours: { connect: tours.map(tour => ({ id: tour.id })) }
      },
      include: { tours: { select: { id: true } }, }
    });

    return res.status(201).json({
      ok: true,
      message: "Order created successfully",
      data: createdOrder,
    } as ResponseData);
  } catch (error) {
    console.error("Error creating order:", error);
    return operationErrorResponse(res);
  }
}

// edit/patch one
export const patchOrderController: RequestHandler = async (req: Request, res: Response) => {
  try {
    const orderId = validateIdAndRespond(res, req.params.order_id);
    if (!orderId) return;

    // order validation
    const foundOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!foundOrder) return notFoundResponse(res, "Order");

    // body validation
    const bodyValidation = PatchOrderSchema.safeParse(req.body);
    if (!bodyValidation.success) return invalidBodyResponse(res, bodyValidation.error);

    // update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: bodyValidation.data.status
      },
      include: {
        tours: true
      }
    });

    return res.status(200).json({
      ok: true,
      message: "Order updated successfully",
      data: updatedOrder,
    } as ResponseData);
  } catch (error) {
    console.error("Error updating order:", error);
    return operationErrorResponse(res);
  }
}


// ----[ Special ]----

// get orders by user
export const getOrdersByUserController: RequestHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.params.user_id;
    const foundUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!foundUser) return notFoundResponse(res, "User");

    const orders = await prisma.order.findMany({
      where: { user_id: userId },
      include: {
        tours: true,
        payment: true,
        preference: true,
      }
    });

    return res.status(200).json({
      ok: true,
      message: "Orders fetched successfully",
      data: orders,
    } as ResponseData);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return operationErrorResponse(res);
  }
}