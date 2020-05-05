import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';
import { Order, Ticket } from '../models';
import { Enums } from '@lm-ticketing/sdk';
import { OrderStatus } from '@lm-ticketing/sdk/build/events/enums';
import { natsWrapper } from '../nats-wrapper';

const buildTicket = async () => {
  return Ticket.build({
    title: 'title',
    price: 20,
  }).save();
};

describe('Delete order by specific user router', () => {
  const path = '/api/orders';

  it('returns 404 if order not found', async () => {
    const id = mongoose.Types.ObjectId();

    await request(app)
      .delete(`${path}/${id}`)
      .set('Cookie', global.signin())
      .expect(404);
  });

  it('returns 401 if order does not belong to user', async () => {
    const { id: ticketId } = await buildTicket();

    const {
      body: { id: orderId },
    } = await request(app)
      .post(path)
      .set('Cookie', global.signin())
      .send({ ticketId })
      .expect(201);

    await request(app)
      .delete(`${path}/${orderId}`)
      .set('Cookie', global.signin())
      .expect(401);
  });

  it('delete order from a specific user', async () => {
    const ticket = await buildTicket();
    const user = global.signin();

    const {
      body: { id: orderId },
    } = await request(app)
      .post(path)
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    await request(app)
      .delete(`${path}/${orderId}`)
      .set('Cookie', user)
      .expect(204);

    await request(app)
      .get(`${path}/${orderId}`)
      .set('Cookie', user)
      .expect(200)
      .then((res) => {
        expect(res.body.status).toEqual(OrderStatus.Cancelled);
      });
  });

  it('emits a order cancelled event', async () => {
    const ticket = await buildTicket();
    const user = global.signin();

    const {
      body: { id: orderId },
    } = await request(app)
      .post(path)
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    await request(app)
      .delete(`${path}/${orderId}`)
      .set('Cookie', user)
      .expect(204);

    await request(app)
      .get(`${path}/${orderId}`)
      .set('Cookie', user)
      .expect(200)
      .then((res) => {
        expect(res.body.status).toEqual(OrderStatus.Cancelled);
      });

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
