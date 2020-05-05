import mongoose from 'mongoose';
import { TicketUpdatedListener } from '../events/listeners';
import { natsWrapper } from '../nats-wrapper';
import { EventInterfaces } from '@lm-ticketing/sdk';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../models';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 100,
  });

  await ticket.save();

  const data: EventInterfaces.TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new title',
    price: 99.99,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, data, msg, ticket };
};

describe('Ticket Updated Listener', () => {
  it('finds, updates and saves a ticket', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
  });

  it('acks the message', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it('throws an error if ticket not found either by id or version and msg not ack', async () => {
    const { listener, data, msg, ticket } = await setup();

    try {
      await listener.onMessage({ ...data, id: mongoose.Types.ObjectId().toHexString() }, msg);
    } catch ({ message }) {
      expect(message).toEqual('Ticket not found');
    }

    try {
      await listener.onMessage({ ...data, version: data.version + 1000 }, msg);
    } catch ({ message }) {
      expect(message).toEqual('Ticket not found');
    }

    expect(msg.ack).not.toHaveBeenCalled();
  });
});
