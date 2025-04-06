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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importStar(require("../models/User"));
const LoanApplication_1 = __importStar(require("../models/LoanApplication"));
const mongoose_1 = __importDefault(require("mongoose"));
// Load environment variables
dotenv_1.default.config();
// Sample data
const adminUser = {
    name: 'Admin User',
    email: 'admin@creditsea.com',
    password: 'Password123',
    role: User_1.UserRole.ADMIN
};
const verifierUser = {
    name: 'Verifier User',
    email: 'verifier@creditsea.com',
    password: 'Password123',
    role: User_1.UserRole.VERIFIER
};
const sampleLoans = [
    {
        applicantName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        address: '123 Main St, City',
        loanAmount: 50000,
        purpose: 'Home Renovation',
        status: LoanApplication_1.LoanStatus.PENDING
    },
    {
        applicantName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '8765432109',
        address: '456 Oak Ave, Town',
        loanAmount: 100000,
        purpose: 'Education',
        status: LoanApplication_1.LoanStatus.PENDING
    },
    {
        applicantName: 'Robert Johnson',
        email: 'robert@example.com',
        phone: '7654321098',
        address: '789 Pine Rd, Village',
        loanAmount: 75000,
        purpose: 'Business Expansion',
        status: LoanApplication_1.LoanStatus.PENDING
    }
];
// Seed function
const seedData = async () => {
    try {
        // Connect to the database
        await (0, database_1.default)();
        // Clear existing data
        await User_1.default.deleteMany({});
        await LoanApplication_1.default.deleteMany({});
        console.log('Previous data cleared');
        // Create users
        const admin = await User_1.default.create(adminUser);
        const verifier = await User_1.default.create(verifierUser);
        console.log('Users created:');
        console.log(`Admin: ${admin.email}`);
        console.log(`Verifier: ${verifier.email}`);
        // Create loan applications
        const loans = await LoanApplication_1.default.insertMany(sampleLoans);
        console.log(`${loans.length} loan applications created`);
        // Close connection
        await mongoose_1.default.disconnect();
        console.log('Database seeded successfully!');
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};
// Run the seed function
seedData();
