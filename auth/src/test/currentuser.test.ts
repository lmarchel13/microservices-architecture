import request from 'supertest';
import { app } from '../app';
import { getCookie, email } from './auth-helper';

describe('Current user route', () => {
  it('responds with details about the current user', async () => {
    const cookie = await getCookie();

    const currentUserResponse = await request(app)
      .get('/api/users/currentuser')
      .set('Cookie', cookie)
      .expect(200);

    expect(currentUserResponse.body.currentUser.email).toEqual(email);
  });

  it('responds with 401 if not authenticated', async () => {
    const response = await request(app)
      .get('/api/users/currentuser')
      .expect(200);

    expect(response.body.currentUser).toBeUndefined();
  });
});
