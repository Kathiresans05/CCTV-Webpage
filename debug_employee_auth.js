import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();
connectDB();

const checkEmployee = async () => {
    try {
        const user = await User.findOne({ email: 'employee@securevision.com' });
        if (!user) {
            console.log('❌ Employee user NOT found in database');
        } else {
            console.log('✅ Employee found:', user.email);
            console.log('Role:', user.role);
            // Check common passwords
            const passwords = ['Password123', 'Emp@123', '123456'];
            for (const pw of passwords) {
                const isMatch = await bcrypt.compare(pw, user.password);
                console.log(`Password "${pw}" Match:`, isMatch);
            }
        }
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

checkEmployee();
