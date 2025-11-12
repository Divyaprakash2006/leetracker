import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthUser extends Document {
  email: string;
  password?: string; // Optional for OAuth users
  name: string;
  provider: 'local' | 'google' | 'github';
  providerId?: string; // OAuth provider user ID
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const authUserSchema = new Schema<IAuthUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function(this: IAuthUser) {
        return this.provider === 'local';
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    providerId: {
      type: String,
      sparse: true, // Allow null but must be unique when set
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for provider + providerId (only for OAuth users)
authUserSchema.index(
  { provider: 1, providerId: 1 }, 
  { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { providerId: { $exists: true, $ne: null } }
  }
);

const AuthUser = mongoose.model<IAuthUser>('AuthUser', authUserSchema);

export default AuthUser;
