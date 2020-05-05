import { BasePublisher, EventInterfaces, Enums } from '@lm-ticketing/sdk';

export class OrderCreatedPublisher extends BasePublisher<
  EventInterfaces.OrderCreatedEvent
> {
  subject: Enums.Subjects.OrderCreated = Enums.Subjects.OrderCreated;
}
