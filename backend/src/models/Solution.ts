import mongoose, { Document, Schema } from 'mongoose';

export interface ISolution extends Document {
  submissionId: string;
  username: string;
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
    submissionId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, index: true },
    problemName: { type: String, required: true },
    problemSlug: { type: String, required: true },
    problemUrl: { type: String, required: true },
    difficulty: { 
      type: String, 
      required: true, 
      enum: ['Easy', 'Medium', 'Hard'] 
    },
    language: { type: String, required: true },
    code: { type: String, required: true },
    runtime: { type: String },
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
SolutionSchema.index({ username: 1, timestamp: -1 });
SolutionSchema.index({ username: 1, difficulty: 1 });

export default mongoose.model<ISolution>('Solution', SolutionSchema);
