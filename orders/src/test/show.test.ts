import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';
import { Ticket } from '../models';

const buildTicket = async () => {
  return Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 20,
  }).save();
};

describe('Show order by specific user router', () => {
  const path = '/api/orders';

  it('returns 404 if order not found', async () => {
    const id = mongoose.Types.ObjectId();

    await request(app).get(`${path}/${id}`).set('Cookie', global.signin()).expect(404);
  });

  it('returns 401 if order does not belong to user', async () => {
    const { id: ticketId } = await buildTicket();

    const {
      body: { id: orderId },
    } = await request(app).post(path).set('Cookie', global.signin()).send({ ticketId }).expect(201);

    await request(app).get(`${path}/${orderId}`).set('Cookie', global.signin()).expect(401);
  });

  it('fetch order from a specific user', async () => {
    const ticket = await buildTicket();
    const user = global.signin();

    const {
      body: { id: orderId },
    } = await request(app).post(path).set('Cookie', user).send({ ticketId: ticket.id }).expect(201);

    await request(app).get(`${path}/${orderId}`).set('Cookie', user).expect(200);
  });
});
