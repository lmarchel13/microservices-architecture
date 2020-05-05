import request from 'supertest';
import { app } from '../app';

describe('Signin route', () => {
  const path = '/api/users/signin';

  it('fail when an email that does not exist is supplied', async () => {
    return request(app)
      .post(path)
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(400);
  });

  it('fails when an incorrect password is supplied', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    await request(app)
      .post(path)
      .send({
        email: 'test@test.com',
        password: 'wrong-password',
      })
      .expect(400);
  });

  it('returns 200 when successfully signin and with a cookie', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    const response = await request(app)
      .post(path)
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});
