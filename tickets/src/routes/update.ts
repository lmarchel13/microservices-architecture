import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, NotFoundError, requireAuth, UnauthorizedError, BadRequestError } from '@lm-ticketing/sdk';
import { Ticket } from '../models/Ticket';
import { TicketUpdatedPublisher } from '../events/publishers/TicketUpdatedPublisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be provided and must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) throw new NotFoundError();

    if (ticket.userId !== req.currentUser!.id) throw new UnauthorizedError('Unauthorized');

    if (ticket.orderId) throw new BadRequestError('Ticket is already reserved');

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
