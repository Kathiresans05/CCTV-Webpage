import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();
connectDB();

const checkUser = async () => {
    try {
        const user = await User.findOne({ email: 'admin@securevision.com' });
        if (!user) {
            console.log('❌ User NOT found in database');
        } else {
            console.log('✅ User found:', user.email);
            console.log('Role:', user.role);
            const isMatch = await bcrypt.compare('Password123', user.password);
            console.log('Password Match:', isMatch);
        }
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

checkUser();
