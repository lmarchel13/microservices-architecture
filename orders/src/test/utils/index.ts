import { Ticket } from '../../models';
import mongoose from 'mongoose';

export const buildTicket = async () => {
  return Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 20,
  }).save();
};
