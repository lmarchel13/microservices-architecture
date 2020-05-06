import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';

import { OrderCreatedListener } from '../OrderCreatedListener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/Ticket';
import { EventInterfaces } from '@lm-ticketing/sdk';
import { Enums } from '@lm-ticketing/sdk';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'title',
    price: 100,
    userId: 'asdffdsa',
  });

  await ticket.save();

  const data: EventInterfaces.OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(), // orderId
    version: 0,
    status: Enums.OrderStatus.Created,
    userId: 'asdffdsa',
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, ticket, data, msg };
};

describe('Order created listener test', () => {
  it('sets the orderId to the ticket', async () => {
    const {
      listener,
      ticket: { id: ticketId },
      data,
      msg,
    } = await setup();

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(ticketId);

    expect(ticket!.orderId).toEqual(data.id);
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
    expect(ticketUpdatedData.orderId).toEqual(data.id);
  });
});
