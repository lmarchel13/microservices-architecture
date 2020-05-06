import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';

import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/Ticket';
import { EventInterfaces } from '@lm-ticketing/sdk';
import { Enums } from '@lm-ticketing/sdk';
import { OrderCancelledListener } from '../OrderCancelledListener';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'title',
    price: 100,
    userId: 'asdffdsa',
  });

  ticket.set({ orderId });

  await ticket.save();

  const data: EventInterfaces.OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, ticket, data, msg, orderId };
};

describe('Order cancelled listener test', () => {
  it('sets the orderId to the ticket', async () => {
    const {
      listener,
      ticket: { id: ticketId },
      data,
      msg,
      orderId,
    } = await setup();

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(ticketId);

    expect(ticket!.orderId).toBeUndefined();
  });

  it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it('publishes a ticket updated event', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(ticketUpdatedData.orderId).toBeUndefined();
  });
});
