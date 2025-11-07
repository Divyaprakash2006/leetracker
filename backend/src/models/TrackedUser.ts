import mongoose, { Document, Schema } from 'mongoose';

export interface ITrackedUser extends Document {
  username: string;
  userId: string;
  normalizedUsername: string;
  realName?: string; // User's real/display name
  addedBy?: string; // Who added this user
  addedAt: Date; // When user was added to tracking
  lastViewedAt?: Date;
  notes?: string;
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}

const TrackedUserSchema = new Schema<ITrackedUser>(
  {
    username: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true },
    normalizedUsername: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    realName: { type: String, trim: true }, // User's real/display name
    addedBy: { type: String, trim: true }, // Who added this user
    addedAt: { type: Date, default: Date.now }, // When user was added
    lastViewedAt: { type: Date },
    notes: { type: String },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

TrackedUserSchema.pre('validate', function (next) {
  if (this.username) {
    this.normalizedUsername = this.username.toLowerCase();
  }
  next();
});

TrackedUserSchema.index({ normalizedUsername: 1 });

export default mongoose.model<ITrackedUser>('TrackedUser', TrackedUserSchema);
