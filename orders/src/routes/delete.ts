import express, { Request, Response } from 'express';
import { Order, Ticket } from '../models';
import { NotFoundError, UnauthorizedError, requireAuth } from '@lm-ticketing/sdk';
import { OrderStatus } from '@lm-ticketing/sdk/build/events/enums';
import { OrderCancelledPublisher } from '../events/publishers';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:id', requireAuth, async (req: Request, res: Response) => {
  const { id: userId } = req.currentUser!;
  const { id: orderId } = req.params;

  const order = await Order.findById(orderId).populate('ticket');

  if (!order) throw new NotFoundError();
  if (order.userId !== userId) throw new UnauthorizedError('Unauthorized');

  order.status = OrderStatus.Cancelled;

  await order.save();

  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: { id: order.ticket.id },
  });

  res.status(204).send(order);
});

export { router as deleteOrderRouter };
