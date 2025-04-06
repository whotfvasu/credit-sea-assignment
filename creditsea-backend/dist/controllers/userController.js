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
exports.deleteUser = exports.createAdmin = exports.getAllAdmins = exports.getAllUsers = void 0;
const User_1 = __importStar(require("../models/User"));
// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        // Only admins can access this endpoint (enforced by middleware)
        const users = await User_1.default.find().select('-password');
        res.status(200).json({ users });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
};
exports.getAllUsers = getAllUsers;
// Get all admins (Admin only)
const getAllAdmins = async (req, res) => {
    try {
        const admins = await User_1.default.find({ role: User_1.UserRole.ADMIN }).select('-password');
        res.status(200).json({ admins });
    }
    catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Server error while fetching admins' });
    }
};
exports.getAllAdmins = getAllAdmins;
// Create a new admin (Admin only)
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if email already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }
        // Create new admin user
        const admin = new User_1.default({
            name,
            email,
            password,
            role: User_1.UserRole.ADMIN
        });
        await admin.save();
        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    }
    catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Server error while creating admin' });
    }
};
exports.createAdmin = createAdmin;
// Delete a user (Admin only)
const deleteUser = async (req, res) => {
    var _a;
    try {
        const { userId } = req.params;
        // Check if user exists
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Prevent admin from deleting their own account
        if (user._id.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) {
            res.status(400).json({ message: 'Cannot delete your own account' });
            return;
        }
        await User_1.default.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
};
exports.deleteUser = deleteUser;
