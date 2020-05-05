import BasePublisher from './BasePublisher';
import { TicketCreatedEvent } from './interfaces';
import { Subjects } from './enums';

export default class TicketCreatedPublisher extends BasePublisher<
  TicketCreatedEvent
> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
