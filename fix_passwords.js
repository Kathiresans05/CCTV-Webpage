import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();
connectDB();

const fixPasswords = async () => {
    try {
        const users = await User.find({});
        console.log(`Found ${users.length} users. Checking passwords...`);
        
        for (let user of users) {
            const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
            if (!isHashed) {
                console.log(`Hashing password for: ${user.email}`);
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
                await user.save();
                console.log(`Updated: ${user.email}`);
            } else {
                console.log(`Already hashed: ${user.email}`);
            }
        }
        
        console.log('--- All users processed ---');
        process.exit();
    } catch (error) {
        console.error('Error fixing passwords:', error);
        process.exit(1);
    }
};

fixPasswords();
