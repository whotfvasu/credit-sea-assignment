"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var LoanStatus;
(function (LoanStatus) {
    LoanStatus["PENDING"] = "pending";
    LoanStatus["VERIFIED"] = "verified";
    LoanStatus["REJECTED"] = "rejected";
    LoanStatus["APPROVED"] = "approved";
})(LoanStatus || (exports.LoanStatus = LoanStatus = {}));
const LoanApplicationSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('LoanApplication', LoanApplicationSchema);
