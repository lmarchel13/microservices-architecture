import { BasePublisher, EventInterfaces, Enums } from '@lm-ticketing/sdk';

export class OrderCancelledPublisher extends BasePublisher<
  EventInterfaces.OrderCancelledEvent
> {
  subject: Enums.Subjects.OrderCancelled = Enums.Subjects.OrderCancelled;
}
