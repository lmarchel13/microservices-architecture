import { BasePublisher, Subjects, EventInterfaces } from '@lm-ticketing/sdk';

export class TicketUpdatedPublisher extends BasePublisher<
  EventInterfaces.TicketUpdatedEvent
> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
