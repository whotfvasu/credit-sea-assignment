import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only admins can access this endpoint (enforced by middleware)
    const users = await User.find().select('-password');
    
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// Get all admins (Admin only)
export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    const admins = await User.find({ role: UserRole.ADMIN }).select('-password');
    
    res.status(200).json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Server error while fetching admins' });
  }
};

// Create a new admin (Admin only)
export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Create new admin user
    const admin = new User({
      name,
      email,
      password,
      role: UserRole.ADMIN
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
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Server error while creating admin' });
  }
};

// Delete a user (Admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Prevent admin from deleting their own account
    if (user._id.toString() === req.user?._id.toString()) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }

    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};