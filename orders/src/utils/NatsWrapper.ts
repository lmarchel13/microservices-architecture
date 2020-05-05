import nats, { Stan } from 'node-nats-streaming';

interface ConnectInterface {
  clusterId: string;
  clientId: string;
  url: string;
}

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }

    return this._client;
  }

  connect(options: ConnectInterface) {
    const { clusterId, clientId, url } = options;
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.info(
          'Connected to NATS',
          JSON.stringify({ url, clusterId, clientId })
        );
        resolve();
      });

      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
