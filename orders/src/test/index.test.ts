import request from 'supertest';
import { app } from '../app';
import { buildTicket } from './utils';

describe('Show all orders router', () => {
  const path = '/api/orders';

  it('fetches all orders from a specific user', async () => {
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    const userOne = global.signin();
    const userTwo = global.signin();

    await request(app).post(path).set('Cookie', userOne).send({ ticketId: ticketOne.id }).expect(201);

    const { body: orderOne } = await request(app)
      .post(path)
      .set('Cookie', userTwo)
      .send({ ticketId: ticketTwo.id })
      .expect(201);

    const { body: orderTwo } = await request(app)
      .post(path)
      .set('Cookie', userTwo)
      .send({ ticketId: ticketThree.id })
      .expect(201);

    await request(app)
      .get(path)
      .set('Cookie', userTwo)
      .expect(200)
      .then((response) => {
        expect(response.body.length).toEqual(2);
        expect(response.body[0].id).toEqual(orderOne.id);
        expect(response.body[1].id).toEqual(orderTwo.id);
      });
  });
});
