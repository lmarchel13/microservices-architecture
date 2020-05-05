import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';
import { Order } from '../models';
import { Enums } from '@lm-ticketing/sdk';
import { natsWrapper } from '../nats-wrapper';
import { buildTicket } from './utils';

describe('New order router', () => {
  const path = '/api/orders';

  it('returns an error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();

    await request(app).post(path).set('Cookie', global.signin()).send({ ticketId }).expect(404);
  });

  it('returns an error if the ticket already exists', async () => {
    const ticket = await buildTicket();

    const order = Order.build({
      ticket,
      userId: 'fake-user-id',
      status: Enums.OrderStatus.Created,
      expiresAt: new Date(),
    });

    await order.save();

    await request(app).post(path).set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(400);
  });

  it('reserves a ticket', async () => {
    const ticket = await buildTicket();

    await request(app).post(path).set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(201);
  });

  it('emits an order created event', async () => {
    const ticket = await buildTicket();

    await request(app).post(path).set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
