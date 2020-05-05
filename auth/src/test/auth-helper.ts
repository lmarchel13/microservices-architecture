import request from 'supertest';
import { app } from '../app';

export const email = 'test@test.com';
const password = 'password';

export const getCookie = async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email, password })
    .expect(201);

  return response.get('Set-Cookie');
};
