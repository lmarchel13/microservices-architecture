import { BasePublisher, Enums, EventInterfaces } from '@lm-ticketing/sdk';

export class TicketCreatedPublisher extends BasePublisher<
  EventInterfaces.TicketCreatedEvent
> {
  subject: Enums.Subjects.TicketCreated = Enums.Subjects.TicketCreated;
}
