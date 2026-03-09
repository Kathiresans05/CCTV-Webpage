import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Stock from './models/Stock.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const users = [
    {
        name: 'Admin User',
        email: 'admin@securevision.com',
        phone: '1234567890',
        password: 'Admin@123',
        role: 'admin'
    },
    {
        name: 'Employee Arjun',
        email: 'arjun@securevision.com',
        phone: '9876543210',
        password: 'Emp@123',
        role: 'employee'
    },
    {
        name: 'Employee Priya',
        email: 'priya@securevision.com',
        phone: '9876543211',
        password: 'Emp@123',
        role: 'employee'
    }
];

const stocks = [
    {
        productId: '1001',
        productName: 'Bullet Cameras Pro Series v1',
        sku: 'BC-PRO-V1',
        category: 'Bullet Cameras',
        brand: 'SecureVision',
        price: 6378,
        quantity: 50,
        reorderLevel: 10
    },
    {
        productId: '1002',
        productName: 'Dome Cameras Ultra Elite',
        sku: 'DC-ULT-E',
        category: 'Dome Cameras',
        brand: 'SecureVision',
        price: 9474,
        quantity: 30,
        reorderLevel: 8
    }
];

const importData = async () => {
    try {
        await User.deleteMany();
        await Stock.deleteMany();

        await User.create(users);
        await Stock.create(stocks);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Stock.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
