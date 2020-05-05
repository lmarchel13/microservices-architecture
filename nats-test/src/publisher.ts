import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events';

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const data = { id: '1', title: 'my title', price: 20 };
  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish(data);
  } catch (error) {
    console.error(error);
  }
});
