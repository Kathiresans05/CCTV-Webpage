import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const checkUsers = async () => {
    try {
        const users = await User.find({}, 'email role password');
        console.log('--- Current Users in DB ---');
        users.forEach(u => {
            console.log(`Email: ${u.email}, Role: ${u.role}, PasswordHashed: ${u.password.startsWith('$2a$')}`);
        });
        process.exit();
    } catch (error) {
        console.error('Error fetching users:', error);
        process.exit(1);
    }
};

checkUsers();
