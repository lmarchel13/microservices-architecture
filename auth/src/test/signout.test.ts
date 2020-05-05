import request from 'supertest';
import { app } from '../app';

describe('Signout route', () => {
  it('clears cookie when signout', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    const signInResponse = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(200);

    expect(signInResponse.get('Set-Cookie')).toBeDefined();

    const signOutResponse = await request(app)
      .post('/api/users/signout')
      .send({})
      .expect(200);

    expect(signOutResponse.get('Set-Cookie')[0]).toEqual(
      'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
    );
  });
});
