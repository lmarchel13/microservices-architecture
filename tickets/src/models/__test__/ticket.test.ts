import { Ticket } from '../ticket';

describe('Ticket model test', () => {
  const userId = '123';
  const title = 'title';
  const price = 100;

  it('implements optimistic concurrency control (OCC)', async () => {
    const ticket = Ticket.build({ userId, title, price });
    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 20 });

    await firstInstance!.save();

    try {
      await secondInstance!.save();
    } catch ({ name }) {
      expect(name).toEqual('VersionError');
    }
  });

  it('increments the version number on multiples saves', async () => {
    const ticket = Ticket.build({ userId, title, price });

    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
  });
});
