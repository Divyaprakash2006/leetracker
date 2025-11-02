import mongoose, { Document, Schema } from 'mongoose';

export interface ITrackedUser extends Document {
  username: string;
  userId: string;
  normalizedUsername: string;
  addedAt: Date;
  lastViewedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrackedUserSchema = new Schema<ITrackedUser>(
  {
    username: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true },
    normalizedUsername: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    addedAt: { type: Date, default: Date.now },
    lastViewedAt: { type: Date },
    notes: { type: String },
  },
  {
    timestamps: true,
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
