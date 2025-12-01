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
  leetcodeSession?: string; // Optional per-user LeetCode session token
  leetcodeCsrfToken?: string; // Optional per-user CSRF token
  leetcodeSessionUpdatedAt?: Date; // When tokens were last updated
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}

const TrackedUserSchema = new Schema<ITrackedUser>(
  {
    username: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true },
    normalizedUsername: { type: String, required: true, lowercase: true, trim: true },
    realName: { type: String, trim: true }, // User's real/display name
    addedBy: { type: String, trim: true }, // Who added this user (display name)
    authUserId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true, index: true }, // Link to AuthUser
    addedAt: { type: Date, default: Date.now }, // When user was added
    lastViewedAt: { type: Date },
    notes: { type: String },
    leetcodeSession: { type: String, select: false },
    leetcodeCsrfToken: { type: String, select: false },
    leetcodeSessionUpdatedAt: { type: Date },
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
// This allows multiple auth users to track the same LeetCode username
TrackedUserSchema.index({ authUserId: 1, normalizedUsername: 1 }, { unique: true });

// Additional indexes for better query performance
TrackedUserSchema.index({ addedAt: -1 }); // For sorting by date
TrackedUserSchema.index({ lastViewedAt: -1 }); // For recent activity queries
TrackedUserSchema.index({ authUserId: 1, addedAt: -1 }); // Compound for user's recent tracks

export default mongoose.model<ITrackedUser>('TrackedUser', TrackedUserSchema);
