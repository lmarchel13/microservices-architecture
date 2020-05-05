import express, { Request, Response } from 'express';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  BadRequestError,
} from '@lm-ticketing/sdk';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket, Order } from '../models';
import { OrderStatus } from '@lm-ticketing/sdk/build/events/enums';
import { OrderCreatedPublisher } from '../events/publishers';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_TIME_SECONDS = 15 * 60;

const validators = [
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('Ticket ID must be provided'),
];

router.post(
  '/api/orders',
  requireAuth,
  validators,
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const { id: userId } = req.currentUser!;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new NotFoundError();

    const isReserved = await ticket.isReserved();
    if (isReserved) throw new BadRequestError('Ticket is already reserved');

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() * EXPIRATION_TIME_SECONDS);

    const order = Order.build({
      userId,
      status: OrderStatus.Created,
      expiresAt,
      ticket,
    });

    await order.save();

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
