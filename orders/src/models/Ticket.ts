import mongoose from 'mongoose';
import { Enums } from '@lm-ticketing/sdk';
import { Order } from './Order';

const NOT_CANCELLED = Object.values(Enums.OrderStatus).filter(
  (status) => status !== Enums.OrderStatus.Cancelled
);

interface TicketAttributes {
  title: string;
  price: number;
}

interface TicketDocument extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDocument> {
  build(attrs: TicketAttributes): TicketDocument;
}

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

schema.statics.build = (attrs: TicketAttributes) => {
  return new Ticket(attrs);
};

schema.methods.isReserved = async function () {
  const order = await Order.findOne({
    ticket: this,
    status: {
      $in: NOT_CANCELLED,
    },
  });

  return !!order;
};

const Ticket = mongoose.model<TicketDocument, TicketModel>('Ticket', schema);

export { Ticket, TicketDocument };
