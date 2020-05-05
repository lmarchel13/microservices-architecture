import { BaseListener, EventInterfaces, Enums } from '@lm-ticketing/sdk';
import { Message } from 'node-nats-streaming';

import Queues from '../queues';
import { Ticket } from '../../models';

export class TicketCreatedListener extends BaseListener<
  EventInterfaces.TicketCreatedEvent
> {
  subject: Enums.Subjects.TicketCreated = Enums.Subjects.TicketCreated;
  queueGroupName = Queues.OrdersService;

  async onMessage(
    data: EventInterfaces.TicketCreatedEvent['data'],
    msg: Message
  ) {
    const { id, title, price } = data;

    const ticket = Ticket.build({ id, title, price });
    await ticket.save();

    msg.ack();
  }
}
