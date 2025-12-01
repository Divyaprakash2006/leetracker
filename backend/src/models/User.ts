import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  normalizedUsername: string;
  profileUrl: string;
  realName?: string; // User's real/original name (optional)
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
  addedBy?: string; // Who added this user (optional)
  authUserId: mongoose.Types.ObjectId;
  createdAt: Date; // Automatically set when user is first added
  updatedAt: Date; // Automatically updated on any change
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true },
    normalizedUsername: { type: String, required: true, lowercase: true, trim: true, index: true },
    profileUrl: { type: String, required: true },
    realName: { type: String }, // User's real/display name
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
    addedBy: { type: String }, // Optional: track who added this user
    authUserId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true, index: true },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

UserSchema.index({ authUserId: 1, normalizedUsername: 1 }, { unique: true });

UserSchema.pre('validate', function (next) {
  if (this.isModified('username') || !this.normalizedUsername) {
    this.normalizedUsername = (this.username || '').toLowerCase();
  }
  next();
});

export default mongoose.model<IUser>('User', UserSchema);
