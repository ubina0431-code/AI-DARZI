import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { CustomerProfile } from '../models/CustomerProfile';
import { TailorProfile } from '../models/TailorProfile';
import { config } from '../config';
import { notificationService } from '../services/notification.service';

const generateToken = (user: { _id: unknown; email: string; role: string; firstName: string; lastName: string }) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role = 'customer', businessName, city, gender, country } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const user = await User.create({ email, password, firstName, lastName, phone, role });

    // Create profile based on role
    if (role === 'customer') {
      await CustomerProfile.create({
        userId: user._id,
        country: country || 'Pakistan',
        city,
        gender,
      });
    } else if (role === 'tailor') {
      if (!businessName) {
        res.status(400).json({ success: false, message: 'Business name is required for tailor registration.' });
        return;
      }
      await TailorProfile.create({
        userId: user._id,
        businessName,
        gender: gender || 'female',
        location: { address: city || '', city: city || '', country: country || 'Pakistan' },
      });
    }

    await notificationService.create({
      userId: user._id.toString(),
      type: 'registration',
      title: 'Welcome to AI Darzi!',
      message: `Welcome ${firstName}! Your account has been created successfully.`,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

export const getMe = async (req: Request & { user?: { id: string; role: string } }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    let profile = null;
    if (user.role === 'customer') {
      profile = await CustomerProfile.findOne({ userId: user._id });
    } else if (user.role === 'tailor') {
      profile = await TailorProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          isVerified: user.isVerified,
        },
        profile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user data.' });
  }
};

export const updateProfile = async (req: Request & { user?: { id: string; role: string } }, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone, avatar, ...profileData } = req.body;
    const userId = req.user!.id;

    await User.findByIdAndUpdate(userId, { firstName, lastName, phone, avatar }, { runValidators: true });

    if (req.user!.role === 'customer') {
      await CustomerProfile.findOneAndUpdate({ userId }, profileData, { upsert: true, runValidators: true });
    } else if (req.user!.role === 'tailor') {
      await TailorProfile.findOneAndUpdate({ userId }, profileData, { runValidators: true });
    }

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};
