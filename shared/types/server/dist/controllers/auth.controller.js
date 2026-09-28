"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const CustomerProfile_1 = require("../models/CustomerProfile");
const TailorProfile_1 = require("../models/TailorProfile");
const config_1 = require("../config");
const notification_service_1 = require("../services/notification.service");
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
};
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role = 'customer', businessName, city, gender, country } = req.body;
        const existing = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existing) {
            res.status(400).json({ success: false, message: 'An account with this email already exists.' });
            return;
        }
        const user = await User_1.User.create({ email, password, firstName, lastName, phone, role });
        // Create profile based on role
        if (role === 'customer') {
            await CustomerProfile_1.CustomerProfile.create({
                userId: user._id,
                country: country || 'Pakistan',
                city,
                gender,
            });
        }
        else if (role === 'tailor') {
            if (!businessName) {
                res.status(400).json({ success: false, message: 'Business name is required for tailor registration.' });
                return;
            }
            await TailorProfile_1.TailorProfile.create({
                userId: user._id,
                businessName,
                gender: gender || 'female',
                location: { address: city || '', city: city || '', country: country || 'Pakistan' },
            });
        }
        await notification_service_1.notificationService.create({
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
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() }).select('+password');
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        let profile = null;
        if (user.role === 'customer') {
            profile = await CustomerProfile_1.CustomerProfile.findOne({ userId: user._id });
        }
        else if (user.role === 'tailor') {
            profile = await TailorProfile_1.TailorProfile.findOne({ userId: user._id });
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user data.' });
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, avatar, ...profileData } = req.body;
        const userId = req.user.id;
        await User_1.User.findByIdAndUpdate(userId, { firstName, lastName, phone, avatar }, { runValidators: true });
        if (req.user.role === 'customer') {
            await CustomerProfile_1.CustomerProfile.findOneAndUpdate({ userId }, profileData, { upsert: true, runValidators: true });
        }
        else if (req.user.role === 'tailor') {
            await TailorProfile_1.TailorProfile.findOneAndUpdate({ userId }, profileData, { runValidators: true });
        }
        res.json({ success: true, message: 'Profile updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=auth.controller.js.map