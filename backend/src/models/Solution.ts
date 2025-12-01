import mongoose, { Document, Schema } from 'mongoose';

export interface ISolution extends Document {
  submissionId: string;
  username: string;
  normalizedUsername: string;
  authUserId: mongoose.Types.ObjectId;
  problemName: string;
  problemSlug: string;
  problemUrl: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  code: string;
  runtime: string;
  memory: string;
  status: string;
  timestamp: number;
  submittedAt: Date;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SolutionSchema = new Schema<ISolution>(
  {
    submissionId: { type: String, required: true, index: true },
    username: { type: String, required: false, index: true, default: 'unknown', trim: true },
    normalizedUsername: { type: String, required: true, lowercase: true, trim: true, index: true },
    authUserId: { type: Schema.Types.ObjectId, ref: 'AuthUser', required: true, index: true },
    problemName: { type: String, required: true },
    problemSlug: { type: String, required: false, default: '' },
    problemUrl: { type: String, required: false, default: '' },
    difficulty: { 
      type: String, 
      required: true, 
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    language: { type: String, required: true, default: 'Unknown' },
    code: { type: String, required: false, default: '' },
    runtime: { type: String, default: 'N/A' },
    memory: { type: String },
    status: { type: String, default: 'Accepted' },
    timestamp: { type: Number, required: true },
    submittedAt: { type: Date, required: true },
    notes: { type: String },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
SolutionSchema.index({ authUserId: 1, normalizedUsername: 1, timestamp: -1 });
SolutionSchema.index({ authUserId: 1, normalizedUsername: 1, difficulty: 1 });
SolutionSchema.index({ authUserId: 1, submissionId: 1 }, { unique: true });

SolutionSchema.pre('validate', function (next) {
  if (this.isModified('username') || !this.normalizedUsername) {
    this.normalizedUsername = (this.username || 'unknown').toLowerCase();
  }
  next();
});

export default mongoose.model<ISolution>('Solution', SolutionSchema);
