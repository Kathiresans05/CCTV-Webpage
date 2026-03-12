import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Booking from './models/Booking.js';
import Stock from './models/Stock.js';
import Enquiry from './models/Enquiry.js';
import Attendance from './models/Attendance.js';
import Notification from './models/Notification.js';
import Leave from './models/Leave.js';
import Cart from './models/Cart.js';
import Wishlist from './models/Wishlist.js';
import generateToken from './utils/generateToken.js';
import { protect, admin, employee } from './middleware/authMiddleware.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = process.env.NODE_ENV === 'production' ? '/tmp' : 'uploads/';
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetypes = /image\/jpeg|image\/jpg|image\/png|image\/webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = mimetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only JPEG, JPG, PNG and WEBP images are allowed'));
    }
});

// ─────────────────────────────────────────────
// API: Auth Endpoints
// ─────────────────────────────────────────────

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            phone: phone || 'N/A',
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                },
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                },
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get current user
app.get('/api/auth/me', protect, async (req, res) => {
    res.json({ success: true, user: req.user });
});

// ─────────────────────────────────────────────
// API: Products & Stock
// ─────────────────────────────────────────────

// Get all products (from Stock)
app.get('/api/products', async (req, res) => {
    try {
        const stocks = await Stock.find({});
        const products = stocks.map(s => ({
            _id: s._id,
            id: s.productId,
            name: s.productName,
            price: s.price,
            image: s.productImage || (s.sku.includes('BC') ? 'bullet_camera' : s.sku.includes('DC') ? 'dome_camera' : 'ptz_camera'),
            category: s.category,
            brand: s.brand,
            sku: s.sku,
            rating: '4.5',
            description: s.description || `${s.brand} ${s.productName}`,
            quantity: s.quantity,
            reorderLevel: s.reorderLevel,
            status: s.status
        }));
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single product details
app.get('/api/products/:id', async (req, res) => {
    try {
        const s = await Stock.findById(req.params.id);
        if (!s) return res.status(404).json({ success: false, message: 'Product not found' });
        
        const product = {
            _id: s._id,
            id: s.productId,
            name: s.productName,
            price: s.price,
            image: s.productImage || (s.sku.includes('BC') ? 'bullet_camera' : s.sku.includes('DC') ? 'dome_camera' : 'ptz_camera'),
            category: s.category,
            brand: s.brand,
            sku: s.sku,
            rating: '4.8',
            description: s.description || `${s.brand} ${s.productName}`,
            quantity: s.quantity,
            reorderLevel: s.reorderLevel,
            status: s.status,
            // Mocking specifications and video for now as they are not in the database schema
            specs: s.specs || ['4K Ultra HD', 'Night Vision Up to 30m', 'Mobile App Integration', '360° Coverage', 'Vandal Proof Design', 'Cloud & Local Recording'],
            videoUrl: s.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Using a placeholder video, realistically would be a real CCTV demo
        };
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// File Upload Endpoint (Cloudinary)
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // Upload to Cloudinary
        // We use the file path provided by multer
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'securevision_products',
            use_filename: true,
            unique_filename: true
        });

        // Optional: Delete local file after upload to Cloudinary to save space
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.json({ 
            success: true, 
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Toggle Wishlist
app.post('/api/wishlist', async (req, res) => {
    try {
        const { email, productId } = req.body;
        const existing = await Wishlist.findOne({ email, productId });
        if (existing) {
            await Wishlist.deleteOne({ _id: existing._id });
            return res.json({ success: true, action: 'removed' });
        } else {
            await Wishlist.create({ email, productId });
            return res.json({ success: true, action: 'added' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get User Wishlist
app.get('/api/wishlist', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: 'Email required' });
        const wishlist = await Wishlist.find({ email });
        res.json({ success: true, data: wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add to Cart
app.post('/api/cart', async (req, res) => {
    try {
        const { email, productId } = req.body;
        const existing = await Cart.findOne({ email, productId });
        if (existing) {
            existing.quantity += 1;
            await existing.save();
        } else {
            await Cart.create({ email, productId });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin Add Product
app.post('/api/admin/products', protect, admin, async (req, res) => {
    try {
        const stock = await Stock.create(req.body);
        res.status(201).json({ success: true, data: stock });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin Update Product
app.put('/api/admin/products/:id', protect, admin, async (req, res) => {
    try {
        const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: stock });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin Delete Product
app.delete('/api/admin/products/:id', protect, admin, async (req, res) => {
    try {
        await Stock.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin Adjust Stock
app.patch('/api/admin/products/:id/stock', protect, admin, async (req, res) => {
    try {
        const { quantity, type } = req.body;
        const stock = await Stock.findById(req.params.id);
        if (!stock) return res.status(404).json({ success: false, message: 'Stock not found' });

        const adjustment = type === 'add' ? quantity : -quantity;
        stock.quantity += adjustment;
        
        // Update status based on quantity
        if (stock.quantity <= 0) {
            stock.status = 'outofstock';
            stock.quantity = 0;
        } else if (stock.quantity <= stock.reorderLevel) {
            stock.status = 'lowstock';
        } else {
            stock.status = 'instock';
        }

        await stock.save();

        if (stock.status !== 'instock') {
            await Notification.create({
                role: 'admin',
                title: stock.status === 'outofstock' ? 'Product Out of Stock' : 'Low Stock Warning',
                message: `${stock.productName} (${stock.sku}) is ${stock.status === 'outofstock' ? 'currently out of stock' : `running low (${stock.quantity} units left)`}`,
                type: 'stock',
                referenceId: stock._id
            });
        }

        res.json({ success: true, data: stock });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────
// API: Bookings Management
// ─────────────────────────────────────────────

// Create Booking (Customer)
app.post('/api/bookings', protect, async (req, res) => {
    try {
        const { 
            productName, productId, productPrice, 
            address, city, preferredDate, preferredTime, 
            notes, customerName, customerPhone, customerEmail 
        } = req.body;
        const bookingId = `BK${Date.now()}`;

        const booking = await Booking.create({
            bookingId,
            customerId: req.user._id,
            customerName: customerName || req.user.name,
            customerEmail: customerEmail || req.user.email,
            customerPhone: customerPhone || req.user.phone,
            productId: productId || 0,
            productName,
            productPrice: productPrice || 0,
            address: address || 'N/A',
            city: city || 'N/A',
            preferredDate,
            preferredTime,
            notes
        });

        await Notification.create({
            role: 'admin',
            title: 'New Booking Request',
            message: `New booking for ${productName} by ${customerName || req.user.name}`,
            type: 'booking',
            referenceId: bookingId
        });

        await Notification.create({
            role: 'employee',
            title: 'New Job Available',
            message: `New installation request at ${city || 'Location'}`,
            type: 'booking',
            referenceId: bookingId
        });

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});



// Legacy endpoint mapping (backward compatibility for existing frontend)
app.post('/api/products/inquiry', async (req, res) => {
    try {
        const { name, email, phone, productName, productPrice, address, message, userId } = req.body;
        const bookingId = `BK${Date.now()}`;
        
        const booking = await Booking.create({
            bookingId,
            customerId: userId || null,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            productId: 0,
            productName,
            productPrice: productPrice || 0,
            address,
            notes: message,
            status: 'Pending'
        });

        res.status(201).json({ success: true, message: 'Booking Submitted Successfully', orderId: bookingId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get User's Bookings
app.get('/api/bookings', protect, async (req, res) => {
    try {
        console.log('--- Bookings Fetch ---');
        console.log('User:', req.user.email, 'Role:', req.user.role);
        let query = {};
        if (req.user.role === 'customer') {
            query = { customerEmail: req.user.email };
        } else if (req.user.role === 'employee') {
            query = { 
                $or: [
                    { status: 'Pending' },
                    { assignedEmployee: req.user._id }
                ]
            };
        }
        console.log('Query:', JSON.stringify(query));
        const bookings = await Booking.find(query).populate('assignedEmployee', 'name email phone').sort({ createdAt: -1 });
        console.log('Bookings found:', bookings.length);
        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error('Bookings Fetch Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get All Bookings (Admin)
app.get('/api/admin/bookings', protect, admin, async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('assignedEmployee', 'name email phone').sort({ createdAt: -1 });
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin Update Booking
app.put('/api/admin/bookings/:id', protect, admin, async (req, res) => {
    try {
        const { status, assignedEmployee } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const oldStatus = booking.status;
        const oldAssignee = booking.assignedEmployee;

        booking.status = status || booking.status;
        booking.assignedEmployee = assignedEmployee || booking.assignedEmployee;
        
        // Sync employee name if assignedEmployee is updated
        if (assignedEmployee && String(assignedEmployee) !== String(oldAssignee)) {
            const empRecord = await User.findById(assignedEmployee);
            if (empRecord) {
                booking.assignedEmployeeName = empRecord.name;
                booking.assignedEmployeePhone = empRecord.phone;
            }
        }

        if (status === 'Accepted' && oldStatus !== 'Accepted') {
            booking.acceptedAt = Date.now();
        }

        await booking.save();

        // Notify Employee if assigned or status changed
        if (assignedEmployee && String(assignedEmployee) !== String(oldAssignee)) {
            await Notification.create({
                userId: assignedEmployee,
                role: 'employee',
                title: 'New Job Assigned',
                message: `You have been assigned to job ${booking.bookingId}`,
                type: 'booking',
                referenceId: booking.bookingId
            });
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────
// API: Attendance
// ─────────────────────────────────────────────

app.get('/api/attendance/status', protect, employee, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({ employeeId: req.user._id, date: today });
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/attendance/checkin', protect, employee, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let attendance = await Attendance.findOne({ employeeId: req.user._id, date: today });

        if (attendance) {
            return res.status(400).json({ success: false, message: 'Already checked in today' });
        }

        attendance = await Attendance.create({
            employeeId: req.user._id,
            date: today,
            checkIn: Date.now()
        });

        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/attendance/checkout', protect, employee, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let attendance = await Attendance.findOne({ employeeId: req.user._id, date: today });

        if (!attendance) return res.status(400).json({ success: false, message: 'No check-in found for today' });
        if (attendance.checkOut) return res.status(400).json({ success: false, message: 'Already checked out today' });

        attendance.checkOut = Date.now();
        const diff = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
        attendance.totalHours = diff.toFixed(2);
        await attendance.save();

        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────
// API: Leave Management
// ─────────────────────────────────────────────

// Request Leave (Employee)
app.post('/api/leaves/request', protect, employee, async (req, res) => {
    console.log('--- LEAVE REQUEST ARRIVED ---');
    console.log('Body:', req.body);
    console.log('User:', req.user?.name);
    try {
        const { leaveType, startDate, endDate, reason } = req.body;
        
        console.log('Creating Leave record...');
        const leave = await Leave.create({
            employeeId: req.user._id,
            employeeName: req.user.name,
            leaveType,
            startDate,
            endDate,
            reason
        });
        console.log('Leave record created:', leave._id);

        console.log('Creating Notification...');
        await Notification.create({
            role: 'admin',
            title: 'New Leave Request',
            message: `${req.user.name} has requested ${leaveType}`,
            type: 'leave',
            referenceId: leave._id
        });
        console.log('Notification created.');

        res.json({ success: true, data: leave });
    } catch (error) {
        console.error('LEAVE REQUEST ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get My Leaves (Employee)
app.get('/api/leaves/my', protect, employee, async (req, res) => {
    try {
        const leaves = await Leave.find({ employeeId: req.user._id }).sort({ appliedAt: -1 });
        res.json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get All Leaves (Admin)
app.get('/api/admin/leaves', protect, admin, async (req, res) => {
    try {
        const leaves = await Leave.find({}).sort({ appliedAt: -1 }).populate('employeeId', 'name email phone');
        res.json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Leave Status (Admin)
app.patch('/api/admin/leaves/:id/status', protect, admin, async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const leave = await Leave.findById(req.params.id);
        
        if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
        
        leave.status = status || leave.status;
        leave.adminNotes = adminNotes || leave.adminNotes;
        await leave.save();

        await Notification.create({
            userId: leave.employeeId,
            role: 'employee',
            title: `Leave ${status}`,
            message: `Your leave request for ${new Date(leave.startDate).toLocaleDateString()} has been ${status.toLowerCase()}.`,
            type: 'leave',
            referenceId: leave._id
        });

        res.json({ success: true, data: leave });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────
// API: Contact & Enquiries
// ─────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
    try {
        const { firstName, lastName, name, email, phone, subject, message } = req.body;
        
        // Construct name if missing but parts are present
        const displayName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Anonymous';

        const enquiry = await Enquiry.create({
            name: displayName,
            email,
            phone: phone || 'N/A',
            subject,
            message
        });

        await Notification.create({
            role: 'admin',
            title: 'New Enquiry',
            message: `New message from ${displayName}`,
            type: 'enquiry',
            referenceId: enquiry._id
        });
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/admin/enquiries', protect, admin, async (req, res) => {
    try {
        const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: enquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────
// API: Employee Management (Admin)
// ─────────────────────────────────────────────
app.get('/api/admin/employees', protect, admin, async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' }).select('-password');
        res.json({ success: true, data: employees });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create Employee
app.post('/api/admin/employees', protect, admin, async (req, res) => {
    try {
        const { name, email, phone, password, role, address } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

        const employee = await User.create({
            name, email, phone, password, role: role || 'employee', address
        });
        res.status(201).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Employee
app.put('/api/admin/employees/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const { name, email, phone, password, role, address, isActive } = req.body;
        
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.role = role || user.role;
        user.address = address || user.address;
        if (isActive !== undefined) user.isActive = isActive;

        // Only update password if provided and not empty
        if (password && password.trim() !== '') {
            user.password = password;
        }

        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete/Deactivate Employee
app.delete('/api/admin/employees/:id', protect, admin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Employee removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/admin/attendance', protect, admin, async (req, res) => {
    try {
        const attendance = await Attendance.find({}).populate('employeeId', 'name email').sort({ date: -1 });
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Employee Attendance History
app.get('/api/attendance/history', protect, employee, async (req, res) => {
    try {
        const attendance = await Attendance.find({ employeeId: req.user._id }).sort({ date: -1 });
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────
// Job Lifecycle (Employee Actions)
// ─────────────────────────────────────────────

// Accept Job
app.patch('/api/bookings/:id/accept', protect, async (req, res) => {
    try {
        const booking = await Booking.findOne({ bookingId: req.params.id });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        if (booking.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Job already accepted or in progress' });
        }

        booking.status = 'Accepted';
        booking.assignedEmployee = req.user._id;
        booking.assignedEmployeeName = req.user.name;
        booking.assignedEmployeePhone = req.user.phone;
        booking.acceptedAt = Date.now();
        await booking.save();

        await Notification.create({
            role: 'admin',
            title: 'Job Accepted',
            message: `${req.user.name} has accepted SV-${booking.bookingId.substring(0,8).toUpperCase()}`,
            type: 'booking',
            referenceId: booking._id
        });

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start Job
app.patch('/api/bookings/:id/start', protect, async (req, res) => {
    try {
        const booking = await Booking.findOne({ bookingId: req.params.id });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        booking.status = 'In Progress';
        booking.startedAt = Date.now();
        await booking.save();

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Complete Job
app.patch('/api/bookings/:id/complete', protect, async (req, res) => {
    try {
        const { proofPhoto, workNotes } = req.body;
        const booking = await Booking.findOne({ bookingId: req.params.id });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        booking.status = 'Completed';
        booking.proofPhoto = proofPhoto;
        booking.workNotes = workNotes;
        booking.completedAt = Date.now();
        await booking.save();

        await Notification.create({
            role: 'admin',
            title: 'Job Completed',
            message: `Technician ${req.user.name} completed SV-${booking.bookingId.substring(0,8).toUpperCase()}`,
            type: 'booking',
            referenceId: booking._id
        });

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────
app.get('/api/notifications', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'admin') {
            query = { role: 'admin' };
        } else if (req.user.role === 'employee') {
            query = { $or: [{ role: 'employee' }, { userId: req.user._id }] };
        } else {
            query = { userId: req.user._id };
        }
        
        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/notifications/read-all', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'admin') {
            query = { role: 'admin' };
        } else {
            query = { userId: req.user._id };
        }
        
        await Notification.updateMany(query, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Global Error Handler for Multer and other errors
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Multer Error: ${err.message}` });
    }
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Export app for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
