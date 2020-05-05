import { BasePublisher, Enums, EventInterfaces } from '@lm-ticketing/sdk';

export class TicketUpdatedPublisher extends BasePublisher<
  EventInterfaces.TicketUpdatedEvent
> {
  subject: Enums.Subjects.TicketUpdated = Enums.Subjects.TicketUpdated;
}
