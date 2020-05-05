import express, { Request, Response } from 'express';
import { Order } from '../models';
import {
  NotFoundError,
  UnauthorizedError,
  requireAuth,
} from '@lm-ticketing/sdk';
import { OrderStatus } from '@lm-ticketing/sdk/build/events/enums';

const router = express.Router();

router.delete(
  '/api/orders/:id',
  requireAuth,
  async (req: Request, res: Response) => {
    const { id: userId } = req.currentUser!;
    const { id: orderId } = req.params;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) throw new NotFoundError();
    if (order.userId !== userId) throw new UnauthorizedError('Unauthorized');

    order.status = OrderStatus.Cancelled;

    await order.save();

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
