import mongoose from 'mongoose';
import { TicketCreatedListener } from '../events/listeners';
import { natsWrapper } from '../nats-wrapper';
import { EventInterfaces } from '@lm-ticketing/sdk';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../models';

const setup = () => {
  const listener = new TicketCreatedListener(natsWrapper.client);
  const data: EventInterfaces.TicketCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'title',
    price: 100,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  // @ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listener, data, msg };
};

describe('Ticket Created Listener', () => {
  it('creates and saves a ticket', async () => {
    const { listener, data, msg } = setup();

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
  });

  it('acks the message', async () => {
    const { listener, data, msg } = setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
