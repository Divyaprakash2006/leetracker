import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  profileUrl: string;
  realName?: string;
  avatar?: string;
  ranking?: number;
  reputation?: number;
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalSubmissions: number;
    acceptanceRate: number;
  };
  badges: string[];
  lastSync: Date;
  autoSync: boolean;
  lastSyncStatus?: 'success' | 'failed';
  lastSyncError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, index: true },
    profileUrl: { type: String, required: true },
    realName: { type: String },
    avatar: { type: String },
    ranking: { type: Number },
    reputation: { type: Number },
    stats: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      totalSubmissions: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
    },
    badges: [{ type: String }],
    lastSync: { type: Date, default: Date.now },
    autoSync: { type: Boolean, default: true },
    lastSyncStatus: { type: String, enum: ['success', 'failed'] },
    lastSyncError: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
