import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthUser extends Document {
  username: string;
  password: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const authUserSchema = new Schema<IAuthUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const AuthUser = mongoose.model<IAuthUser>('AuthUser', authUserSchema);

export default AuthUser;
