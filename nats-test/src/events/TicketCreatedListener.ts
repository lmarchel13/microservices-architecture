import BaseListener from './BaseListener';
import { Message } from 'node-nats-streaming';
import { Subjects } from './enums';
import { TicketCreatedEvent } from './interfaces';

export default class TicketCreatedListener extends BaseListener<
  TicketCreatedEvent
> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event data', data);

    msg.ack();
  }
}
