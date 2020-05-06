import { BaseListener, EventInterfaces, Enums } from '@lm-ticketing/sdk';
import { Message } from 'node-nats-streaming';
import Queues from '../queues';
import { Ticket } from '../../models/Ticket';
import { TicketUpdatedPublisher } from '../publishers/TicketUpdatedPublisher';

export class OrderCancelledListener extends BaseListener<EventInterfaces.OrderCancelledEvent> {
  subject: Enums.Subjects.OrderCancelled = Enums.Subjects.OrderCancelled;
  queueGroupName = Queues.TicketsService;
  ORDER_CANCELLED = undefined;

  async onMessage(data: EventInterfaces.OrderCancelledEvent['data'], msg: Message) {
    const {
      id: orderId,
      version,
      ticket: { id: ticketId },
    } = data;

    console.info('Cancelling ticket', JSON.stringify({ ticketId, orderId, version }));

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) throw new Error('Ticket not found');

    ticket.set({ orderId: this.ORDER_CANCELLED });

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
