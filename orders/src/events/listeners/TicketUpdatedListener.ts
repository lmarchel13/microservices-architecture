import { BaseListener, EventInterfaces, Enums } from '@lm-ticketing/sdk';
import { Message } from 'node-nats-streaming';
import Queues from '../queues';
import { Ticket } from '../../models';

export class TicketUpdatedListener extends BaseListener<EventInterfaces.TicketUpdatedEvent> {
  subject: Enums.Subjects.TicketUpdated = Enums.Subjects.TicketUpdated;
  queueGroupName = Queues.OrdersService;

  async onMessage(data: EventInterfaces.TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) throw new Error('Ticket not found');

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
