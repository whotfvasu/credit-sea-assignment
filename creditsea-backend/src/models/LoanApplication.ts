import mongoose, { Document, Schema } from 'mongoose';

export enum LoanStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  APPROVED = 'approved'
}

export interface ILoanApplication extends Document {
  applicantName: string;
  email: string;
  phone: string;
  address: string;
  loanAmount: number;
  purpose: string;
  status: LoanStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  verificationDate?: Date;
  approvalDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoanApplicationSchema: Schema = new Schema(
  {
    applicantName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    loanAmount: {
      type: Number,
      required: true,
      min: 1000
    },
    purpose: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.PENDING
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationDate: {
      type: Date
    },
    approvalDate: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema);