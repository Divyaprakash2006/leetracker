import mongoose, { Document, Schema } from 'mongoose';

export interface ITrackedUser extends Document {
  username: string;
  userId: string;
  normalizedUsername: string;
  realName?: string; // User's real/display name
  addedBy?: string; // Who added this user (display name)
  authUserId: mongoose.Types.ObjectId; // Link to AuthUser who is tracking this
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
    normalizedUsername: { type: String, required: true, lowercase: true, trim: true, index: true },
    realName: { type: String, trim: true }, // User's real/display name
    addedBy: { type: String, trim: true }, // Who added this user (display name)
    authUserId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true, index: true }, // Link to AuthUser
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

// Compound index: each authUser can have unique tracked usernames
TrackedUserSchema.index({ authUserId: 1, normalizedUsername: 1 }, { unique: true });
TrackedUserSchema.index({ normalizedUsername: 1 });

export default mongoose.model<ITrackedUser>('TrackedUser', TrackedUserSchema);
