import request from 'supertest';
import { app } from '../app';

describe('Signup route', () => {
  const path = '/api/users/signup';

  it('returns 201 on successfull signup', async () => {
    return request(app)
      .post(path)
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);
  });

  it('returns 400 with an invalid email', async () => {
    return request(app)
      .post(path)
      .send({
        email: 'test.com',
        password: 'password',
      })
      .expect(400);
  });

  it('returns 400 with an invalid password - less than 4', async () => {
    return request(app)
      .post(path)
      .send({
        email: 'test@test.com',
        password: '123',
      })
      .expect(400);
  });

  it('returns 400 with an invalid password - bigger than 20', async () => {
    return request(app)
      .post(path)
      .send({
        email: 'test.com',
        password: '12345678901234567890_',
      })
      .expect(400);
  });

  it('returns 400 with missing email and password', async () => {
    return request(app).post(path).send({}).expect(400);
  });

  it('not allow duplicate email', async () => {
    await request(app)
      .post(path)
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    await request(app)
      .post(path)
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(400);
  });

  it('sets a cookie after successful request', async () => {
    const response = await request(app)
      .post(path)
      .send({
        email: 'test@test.com',
        password: 'password',
      })
      .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});
