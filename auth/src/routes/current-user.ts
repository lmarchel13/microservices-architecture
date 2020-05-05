import express, { Request, Response } from 'express';
import { currentUser } from '@lm-ticketing/sdk';

const router = express.Router();

router.get(
  '/api/users/currentuser',
  currentUser,
  (req: Request, res: Response) => {
    const { currentUser } = req;

    res.send({ currentUser });
  }
);

export { router as currentUserRouter };
