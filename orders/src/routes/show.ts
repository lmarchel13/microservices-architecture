import express, { Request, Response } from 'express';
import {
  requireAuth,
  NotFoundError,
  UnauthorizedError,
} from '@lm-ticketing/sdk';
import { Order } from '../models';

const router = express.Router();

router.get(
  '/api/orders/:id',
  requireAuth,
  async (req: Request, res: Response) => {
    const { id: userId } = req.currentUser!;
    const { id: orderId } = req.params;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) throw new NotFoundError();
    if (order.userId !== userId) throw new UnauthorizedError('Unauthorized');

    res.send(order);
  }
);

export { router as showOrderRouter };
