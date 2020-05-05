import { BasePublisher, Subjects, EventInterfaces } from '@lm-ticketing/sdk';

export class TicketCreatedPublisher extends BasePublisher<
  EventInterfaces.TicketCreatedEvent
> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
