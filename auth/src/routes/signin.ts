import express, { Request, Response } from 'express';
import { app } from '../app';
import { validators, Password } from '../utils';
import { validateRequest, BadRequestError } from '@lm-ticketing/sdk';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
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

export { router as signInRouter };
