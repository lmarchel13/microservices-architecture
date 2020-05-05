import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './utils';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('No JWT secret provided');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('No MONGO_URI provided');
  }

  if (
    !process.env.NATS_CLIENT_ID ||
    !process.env.NATS_URL ||
    !process.env.NATS_CLUSTER_ID
  ) {
    throw new Error(
      'Missing NATS variables. Please provide NATS_URL, NATS_CLUSTER_ID and NATS_CLIENT_ID'
    );
  }

  try {
    await natsWrapper.connect({
      clusterId: process.env.NATS_CLUSTER_ID,
      clientId: process.env.NATS_CLIENT_ID,
      url: process.env.NATS_URL,
    });

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');

      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.info(
      '[ORDERS SERVICE] Connected successfully to tickets database'
    );
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log('[ORDERS SERVICE] Listening on port 3000');
  });
};

start();
