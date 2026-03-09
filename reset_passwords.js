import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const resetPasswords = async () => {
    try {
        const usersToReset = [
            { email: 'admin@securevision.com', password: 'Password123' },
            { email: 'employee@securevision.com', password: 'Password123' }
        ];

        for (let data of usersToReset) {
            const user = await User.findOne({ email: data.email });
            if (user) {
                console.log(`Resetting password for: ${user.email} to "Password123"`);
                user.password = data.password; // This will be hashed by the 'save' hook
                await user.save();
                console.log(`Updated ${user.email}`);
            } else {
                console.log(`User not found: ${data.email}`);
            }
        }

        process.exit();
    } catch (error) {
        console.error('Error resetting passwords:', error);
        process.exit(1);
    }
};

resetPasswords();
