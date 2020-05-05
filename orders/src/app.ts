import express, { Request, Response } from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { body } from 'express-validator';
import {
  errorHandler,
  NotFoundError,
  currentUser,
  requireAuth,
  validateRequest,
  UnauthorizedError,
} from '@lm-ticketing/sdk';
import { Ticket } from './models/Ticket';
import { TicketCreatedPublisher, TicketUpdatedPublisher } from './events';
import { natsWrapper } from './utils';

const app = express();
const validators = {
  createTicket: [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  updateTicket: [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
};

app.set('trust proxy', true);

app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);

app.post(
  '/api/tickets',
  requireAuth,
  validators.createTicket,
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const userId = req.currentUser!.id;

    const ticket = Ticket.build({ title, price, userId });
    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(201).send(ticket);
  }
);

app.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);

  if (!ticket) throw new NotFoundError();

  res.send(ticket);
});

app.get('/api/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({});

  res.send(tickets);
});

app.put(
  '/api/tickets/:id',
  requireAuth,
  validators.updateTicket,
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, price } = req.body;
    const userId = req.currentUser!.id;
    const ticket = await Ticket.findById(id);

    if (!ticket) throw new NotFoundError();

    if (ticket.userId !== userId) {
      throw new UnauthorizedError('You do not own this ticket');
    }

    ticket.set({ title, price });
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.send(ticket);
  }
);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
