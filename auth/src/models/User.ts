import mongoose from 'mongoose';
import { Password } from '../utils';

interface UserAttributes {
  email: string;
  password: string;
}

interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDocument> {
  build(attributes: UserAttributes): UserDocument;
}

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;

        delete ret.password;
        delete ret._id;
      },
      versionKey: false,
    },
  }
);

schema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashedPassword = await Password.hashPassword(this.get('password'));
    this.set('password', hashedPassword);
  }

  done();
});

schema.statics.build = (attributes: UserAttributes) => new User(attributes);

const User = mongoose.model<UserDocument, UserModel>('User', schema);

export { User };
