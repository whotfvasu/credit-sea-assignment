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
const express_1 = require("express");
const loanController = __importStar(require("../controllers/loanController"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// Public route for submitting applications
router.post('/', loanController.createLoanApplication);
// Protected routes - accessible by both verifiers and admins
router.get('/', auth_1.auth, loanController.getAllLoanApplications);
router.get('/dashboard', auth_1.auth, loanController.getDashboardStats);
router.get('/:id', auth_1.auth, loanController.getLoanApplicationById);
// Verifier routes
router.put('/:id/verify', auth_1.auth, (0, auth_1.authorize)([User_1.UserRole.VERIFIER]), loanController.verifyLoanApplication);
router.put('/:id/reject-verifier', auth_1.auth, (0, auth_1.authorize)([User_1.UserRole.VERIFIER]), loanController.rejectLoanApplication);
// Admin routes
router.put('/:id/approve', auth_1.auth, (0, auth_1.authorize)([User_1.UserRole.ADMIN]), loanController.approveLoanApplication);
router.put('/:id/reject-admin', auth_1.auth, (0, auth_1.authorize)([User_1.UserRole.ADMIN]), loanController.rejectLoanApplication);
exports.default = router;
