import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const inspectPasswords = async () => {
    try {
        const users = await User.find({}, 'email password');
        console.log('--- Raw Password Inspection ---');
        users.forEach(u => {
            console.log(`Email: ${u.email}`);
            console.log(`Password: "${u.password}"`);
            console.log(`Length: ${u.password.length}`);
            console.log('---------------------------');
        });
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

inspectPasswords();
