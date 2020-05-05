import express, { Request, Response } from 'express';
import { requireAuth } from '@lm-ticketing/sdk';
import { Order } from '../models';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const { id: userId } = req.currentUser!;

  const orders = await Order.find({ userId }).populate('ticket');

  res.send(orders);
});

export { router as indexOrderRouter };
