import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('No JWT secret provided');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('No MONGO_URI provided');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.info('[AUTH SERVICE] Connected successfully to auth database');
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log('[AUTH SERVICE] Listening on port 3000');
  });
};

start();
