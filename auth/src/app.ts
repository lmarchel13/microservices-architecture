import express, { Request, Response } from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import jwt from 'jsonwebtoken';
import {
  currentUser,
  validateRequest,
  BadRequestError,
  errorHandler,
  NotFoundError,
} from '@lm-ticketing/sdk';

import { validators, Password } from './utils';
import { User } from './models/User';

const app = express();

app.set('trust proxy', true);

app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.get(
  '/api/users/currentuser',
  currentUser,
  (req: Request, res: Response) => {
    const { currentUser } = req;

    res.send({ currentUser });
  }
);

app.post(
  '/api/users/signup',
  validators.signUp,
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (await User.findOne({ email })) {
      throw new BadRequestError('Email already in use');
    }

    const user = User.build({ email, password });
    await user.save();

    const token = jwt.sign({ id: user.id, email }, process.env.JWT_KEY!);

    req.session = { jwt: token };

    return res.status(201).send(user);
  }
);

app.post(
  '/api/users/signin',
  validators.signIn,
  validateRequest,
  async (req: Request, res: Response) => {
    const DEFAULT_ERROR_MESSAGE = 'Invalid credentials';
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) throw new BadRequestError(DEFAULT_ERROR_MESSAGE);

    const isPasswordCorrect = await Password.verifyPassword(
      user.password,
      password
    );

    if (!isPasswordCorrect) throw new BadRequestError(DEFAULT_ERROR_MESSAGE);

    const token = jwt.sign({ id: user.id, email }, process.env.JWT_KEY!);

    req.session = { jwt: token };

    return res.status(200).send(user);
  }
);

app.post('/api/users/signout', (req, res) => {
  req.session = null;

  res.send({});
});

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
