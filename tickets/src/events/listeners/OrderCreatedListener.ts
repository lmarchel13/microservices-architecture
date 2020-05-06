import { BaseListener, EventInterfaces, Enums } from '@lm-ticketing/sdk';
import { Message } from 'node-nats-streaming';
import Queues from '../queues';
import { Ticket } from '../../models/Ticket';
import { TicketUpdatedPublisher } from '../publishers/TicketUpdatedPublisher';

export class OrderCreatedListener extends BaseListener<EventInterfaces.OrderCreatedEvent> {
  subject: Enums.Subjects.OrderCreated = Enums.Subjects.OrderCreated;
  queueGroupName = Queues.TicketsService;

  async onMessage(data: EventInterfaces.OrderCreatedEvent['data'], msg: Message) {
    const {
      id: orderId,
      ticket: { id: ticketId },
    } = data;

    console.info('Reserving ticket', JSON.stringify({ ticketId, orderId }));

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) throw new Error('Ticket not found');

    ticket.set({ orderId });

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });

    msg.ack();
  }
}
