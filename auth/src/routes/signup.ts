import express, { Request, Response } from 'express';
import { validators } from '../utils';
import { validateRequest, BadRequestError } from '@lm-ticketing/sdk';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
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

export { router as signUpRouter };
