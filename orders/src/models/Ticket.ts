import mongoose from 'mongoose';
import { Enums } from '@lm-ticketing/sdk';
import { Order } from './Order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

const NOT_CANCELLED = Object.values(Enums.OrderStatus).filter((status) => status !== Enums.OrderStatus.Cancelled);

interface TicketAttributes {
  id: string;
  title: string;
  price: number;
}

interface TicketDocument extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface FindByEvent {
  id: string;
  version: number;
}

interface TicketModel extends mongoose.Model<TicketDocument> {
  build(attrs: TicketAttributes): TicketDocument;
  findByEvent(event: FindByEvent): Promise<TicketDocument | null>;
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

schema.set('versionKey', 'version');
schema.plugin(updateIfCurrentPlugin);

schema.statics.build = (attrs: TicketAttributes) => {
  const { id: _id } = attrs;
  delete attrs.id;

  return new Ticket({ _id, ...attrs });
};

schema.statics.findByEvent = (event: FindByEvent) => Ticket.findOne({ _id: event.id, version: event.version - 1 });

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
