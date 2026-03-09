import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Stock from './models/Stock.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Stock.deleteMany();

        // Create Admin
        await User.create({
            name: 'Admin User',
            email: 'admin@securevision.com',
            phone: '9876543210',
            password: 'Password123',
            role: 'admin'
        });

        // Create Employee
        await User.create({
            name: 'Employee One',
            email: 'employee@securevision.com',
            phone: '9876543211',
            password: 'Password123',
            role: 'employee'
        });

        // Sample Stocks
        await Stock.create([
            {
                productId: '101',
                productName: 'Secure Cam X1',
                brand: 'SecureVision',
                sku: 'BC-001',
                category: 'Bullet Camera',
                price: 4500,
                quantity: 25,
                reorderLevel: 5
            },
            {
                productId: '102',
                productName: 'Dome Guard V2',
                brand: 'SecureVision',
                sku: 'DC-002',
                category: 'Dome Camera',
                price: 3200,
                quantity: 4,
                reorderLevel: 5
            }
        ]);

        console.log('✅ Default users and stock seeded successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
