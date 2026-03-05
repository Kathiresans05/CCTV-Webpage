import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// Users & Auth Store
// ─────────────────────────────────────────────
let usersStore = [
    { id: 0, name: 'Admin', email: 'admin@gmail.com', password: 'admin123', role: 'admin' }
]; // { id, name, email, password, role }
let userIdCounter = 1;

// ─────────────────────────────────────────────
// API: Auth Endpoints
// ─────────────────────────────────────────────

// Signup
app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = usersStore.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    const newUser = { id: userIdCounter++, name, email, password, role: 'customer' };
    usersStore.push(newUser);

    // In a real app, we'd use JWT or session. For this mock, we just return user info.
    res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = usersStore.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
});

// Get current user (Mock)
app.get('/api/auth/me', (req, res) => {
    // This would normally check a token/session. 
    // For now, we'll let the frontend manage the state after login/signup.
    res.status(200).json({ success: true, user: null });
});

// ─────────────────────────────────────────────
// Products Data (single source of truth)
// ─────────────────────────────────────────────
const productsData = [
    {
        "id": 1,
        "name": "Bullet Cameras Pro Series v1",
        "price": 6378,
        "image": "bullet_camera",
        "category": "Bullet Cameras",
        "rating": "4.1",
        "description": "Professional Bullet Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 2,
        "name": "Bullet Cameras Ultra Elite",
        "price": 9474,
        "image": "dome_camera",
        "category": "Bullet Cameras",
        "rating": "4.8",
        "description": "Enterprise-grade Bullet Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 3,
        "name": "Dome Cameras Pro Series v1",
        "price": 10523,
        "image": "dome_camera",
        "category": "Dome Cameras",
        "rating": "4.3",
        "description": "Professional Dome Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 4,
        "name": "Dome Cameras Ultra Elite",
        "price": 28453,
        "image": "ptz_camera",
        "category": "Dome Cameras",
        "rating": "4.9",
        "description": "Enterprise-grade Dome Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 5,
        "name": "PTZ Cameras Pro Series v1",
        "price": 18234,
        "image": "ptz_camera",
        "category": "PTZ Cameras",
        "rating": "4.6",
        "description": "Professional PTZ Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 6,
        "name": "PTZ Cameras Ultra Elite",
        "price": 23456,
        "image": "bullet_camera",
        "category": "PTZ Cameras",
        "rating": "4.7",
        "description": "Enterprise-grade PTZ Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 7,
        "name": "Fisheye Cameras Pro Series v1",
        "price": 5432,
        "image": "bullet_camera",
        "category": "Fisheye Cameras",
        "rating": "4.2",
        "description": "Professional Fisheye Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 8,
        "name": "Fisheye Cameras Ultra Elite",
        "price": 12345,
        "image": "dome_camera",
        "category": "Fisheye Cameras",
        "rating": "4.8",
        "description": "Enterprise-grade Fisheye Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 9,
        "name": "Wireless Wi-Fi Cameras Pro Series v1",
        "price": 8765,
        "image": "dome_camera",
        "category": "Wireless Wi-Fi Cameras",
        "rating": "4.5",
        "description": "Professional Wireless Wi-Fi Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 10,
        "name": "Wireless Wi-Fi Cameras Ultra Elite",
        "price": 19876,
        "image": "ptz_camera",
        "category": "Wireless Wi-Fi Cameras",
        "rating": "4.9",
        "description": "Enterprise-grade Wireless Wi-Fi Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 11,
        "name": "Solar Powered Cameras Pro Series v1",
        "price": 12345,
        "image": "ptz_camera",
        "category": "Solar Powered Cameras",
        "rating": "4.4",
        "description": "Professional Solar Powered Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 12,
        "name": "Solar Powered Cameras Ultra Elite",
        "price": 25432,
        "image": "bullet_camera",
        "category": "Solar Powered Cameras",
        "rating": "4.7",
        "description": "Enterprise-grade Solar Powered Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 13,
        "name": "4K Ultra HD Cameras Pro Series v1",
        "price": 15678,
        "image": "bullet_camera",
        "category": "4K Ultra HD Cameras",
        "rating": "4.8",
        "description": "Professional 4K Ultra HD Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 14,
        "name": "4K Ultra HD Cameras Ultra Elite",
        "price": 32145,
        "image": "dome_camera",
        "category": "4K Ultra HD Cameras",
        "rating": "5.0",
        "description": "Enterprise-grade 4K Ultra HD Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 15,
        "name": "Color Night Vision Cameras Pro Series v1",
        "price": 9876,
        "image": "dome_camera",
        "category": "Color Night Vision Cameras",
        "rating": "4.6",
        "description": "Professional Color Night Vision Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 16,
        "name": "Color Night Vision Cameras Ultra Elite",
        "price": 21345,
        "image": "ptz_camera",
        "category": "Color Night Vision Cameras",
        "rating": "4.9",
        "description": "Enterprise-grade Color Night Vision Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 17,
        "name": "Thermal Imaging Cameras Pro Series v1",
        "price": 18765,
        "image": "ptz_camera",
        "category": "Thermal Imaging Cameras",
        "rating": "4.3",
        "description": "Professional Thermal Imaging Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 18,
        "name": "Thermal Imaging Cameras Ultra Elite",
        "price": 35432,
        "image": "bullet_camera",
        "category": "Thermal Imaging Cameras",
        "rating": "4.7",
        "description": "Enterprise-grade Thermal Imaging Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 19,
        "name": "LPR (License Plate) Cameras Pro Series v1",
        "price": 14567,
        "image": "bullet_camera",
        "category": "LPR (License Plate) Cameras",
        "rating": "4.5",
        "description": "Professional LPR (License Plate) Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 20,
        "name": "LPR (License Plate) Cameras Ultra Elite",
        "price": 27654,
        "image": "dome_camera",
        "category": "LPR (License Plate) Cameras",
        "rating": "4.8",
        "description": "Enterprise-grade LPR (License Plate) Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 21,
        "name": "Panoramic Cameras Pro Series v1",
        "price": 11234,
        "image": "dome_camera",
        "category": "Panoramic Cameras",
        "rating": "4.4",
        "description": "Professional Panoramic Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 22,
        "name": "Panoramic Cameras Ultra Elite",
        "price": 24321,
        "image": "ptz_camera",
        "category": "Panoramic Cameras",
        "rating": "4.7",
        "description": "Enterprise-grade Panoramic Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 23,
        "name": "Varifocal Cameras Pro Series v1",
        "price": 9543,
        "image": "ptz_camera",
        "category": "Varifocal Cameras",
        "rating": "4.3",
        "description": "Professional Varifocal Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 24,
        "name": "Varifocal Cameras Ultra Elite",
        "price": 18765,
        "image": "bullet_camera",
        "category": "Varifocal Cameras",
        "rating": "4.6",
        "description": "Enterprise-grade Varifocal Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 25,
        "name": "Hidden Pinhole Cameras Pro Series v1",
        "price": 6543,
        "image": "bullet_camera",
        "category": "Hidden Pinhole Cameras",
        "rating": "4.1",
        "description": "Professional Hidden Pinhole Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    },
    {
        "id": 26,
        "name": "Hidden Pinhole Cameras Ultra Elite",
        "price": 13456,
        "image": "dome_camera",
        "category": "Hidden Pinhole Cameras",
        "rating": "4.5",
        "description": "Enterprise-grade Hidden Pinhole Cameras with advanced AI features.",
        "features": [
            "AI Recognition",
            "Super Night Vision",
            "IK10 Vandal-Proof",
            "Cloud Storage"
        ]
    },
    {
        "id": 27,
        "name": "Facial Recognition Cameras Pro Series v1",
        "price": 16789,
        "image": "dome_camera",
        "category": "Facial Recognition Cameras",
        "rating": "4.7",
        "description": "Professional Facial Recognition Cameras for high-end security and surveillance.",
        "features": [
            "Motion Detection",
            "Night Vision",
            "Weatherproof",
            "Mobile App Support"
        ]
    }
];

// ─────────────────────────────────────────────
// In-Memory Bookings Store
// ─────────────────────────────────────────────
let bookingsStore = [];
let cartStore = []; // { email, productId, quantity }
let wishlistStore = []; // { email, productId }
let bookingIdCounter = 1000;

const generateOrderId = () => `SV-${Date.now()}-${bookingIdCounter++}`;

// ─────────────────────────────────────────────
// Helper: create nodemailer transporter
// ─────────────────────────────────────────────
const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_EMAIL@gmail.com',   // Replace with your Gmail
        pass: 'YOUR_APP_PASSWORD'       // Replace with your App Password
    }
});

// ─────────────────────────────────────────────
// API: GET /api/products
// ─────────────────────────────────────────────
app.get('/api/products', (req, res) => {
    const { search } = req.query;
    let filteredProducts = [...productsData];

    if (search) {
        const query = search.toLowerCase();
        filteredProducts = productsData.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }

    res.status(200).json({ success: true, data: filteredProducts });
});

// ─────────────────────────────────────────────
// API: GET /api/bookings
// Returns all bookings (optionally filter by email)
// ─────────────────────────────────────────────
app.get('/api/bookings', (req, res) => {
    const { email } = req.query;
    const result = email
        ? bookingsStore.filter(b => b.email.toLowerCase() === email.toLowerCase())
        : bookingsStore;

    // Return newest first
    res.status(200).json({ success: true, data: [...result].reverse() });
});

// ─────────────────────────────────────────────
// API: PATCH /api/bookings/:orderId/status
// Admin endpoint to update booking status
// Body: { status: 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' }
// ─────────────────────────────────────────────
app.patch('/api/bookings/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const booking = bookingsStore.find(b => b.orderId === orderId);
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString();

    res.status(200).json({ success: true, data: booking });
});

// ─────────────────────────────────────────────
// API: POST /api/products/inquiry
// Creates a booking + sends email
// ─────────────────────────────────────────────
app.post('/api/products/inquiry', async (req, res) => {
    const { name, email, phone, productName, message } = req.body;

    if (!name || !email || !productName) {
        return res.status(400).json({ success: false, message: 'Name, email, and product name are required.' });
    }

    // Create booking record
    const newBooking = {
        orderId: generateOrderId(),
        name,
        email,
        phone: phone || '',
        productName,
        message: message || '',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    bookingsStore.push(newBooking);

    console.log('New booking created:', newBooking);

    try {
        const transporter = createTransporter();

        const adminMail = {
            from: email,
            to: 'kathiresan.antigraviity@gmail.com',
            subject: `New Product Inquiry: ${productName}`,
            html: `
                <h3>New Product Inquiry — SecureVision</h3>
                <p><strong>Order ID:</strong> ${newBooking.orderId}</p>
                <table style="border-collapse:collapse;width:100%">
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Customer Name</td><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Phone</td><td style="padding:8px;border:1px solid #ddd;">${phone || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Product</td><td style="padding:8px;border:1px solid #ddd;">${productName}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Message</td><td style="padding:8px;border:1px solid #ddd;">${message || 'No message provided.'}</td></tr>
                </table>
            `
        };

        const customerMail = {
            from: 'kathiresan.antigraviity@gmail.com',
            to: email,
            subject: `Booking Confirmed — ${productName} | Order ${newBooking.orderId}`,
            html: `
                <h3>Hello ${name},</h3>
                <p>Thank you for your inquiry about the <strong>${productName}</strong>.</p>
                <p>Your booking reference is: <strong>${newBooking.orderId}</strong></p>
                <p>Current Status: <strong>Pending</strong> — Our team will contact you shortly.</p>
                <br/>
                <p>Best regards,<br/><strong>SecureVision CCTV Solutions Team</strong></p>
            `
        };

        if (transporter.options.auth.user === 'YOUR_EMAIL@gmail.com') {
            console.log('SMTP not configured. Simulating inquiry email send...');
            return res.status(200).json({
                success: true,
                message: 'Inquiry submitted! Your booking is now Pending. Track it on the My Bookings page.',
                orderId: newBooking.orderId
            });
        }

        await transporter.sendMail(adminMail);
        await transporter.sendMail(customerMail);

        res.status(200).json({
            success: true,
            message: 'Inquiry submitted! Your booking is now Pending. Track it on the My Bookings page.',
            orderId: newBooking.orderId
        });
    } catch (error) {
        console.error('Error sending inquiry email:', error);
        res.status(500).json({ success: false, message: 'Failed to submit inquiry. Please try again later.' });
    }
});

// ─────────────────────────────────────────────
// API: Cart Endpoints
// ─────────────────────────────────────────────
app.get('/api/cart', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const userCart = cartStore.filter(item => item.email.toLowerCase() === email.toLowerCase());
    const data = userCart.map(item => {
        const product = productsData.find(p => p.id === item.productId);
        return { ...item, product };
    });

    res.status(200).json({ success: true, data });
});

app.post('/api/cart', (req, res) => {
    const { email, productId, quantity = 1 } = req.body;
    if (!email || !productId) return res.status(400).json({ success: false, message: 'Email and productId are required.' });

    const existingItem = cartStore.find(item => item.email.toLowerCase() === email.toLowerCase() && item.productId === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cartStore.push({ email, productId, quantity });
    }
    res.status(200).json({ success: true, message: 'Added to cart' });
});

// ─────────────────────────────────────────────
// API: Wishlist Endpoints
// ─────────────────────────────────────────────
app.get('/api/wishlist', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const userWishlist = wishlistStore.filter(item => item.email.toLowerCase() === email.toLowerCase());
    const data = userWishlist.map(item => {
        const product = productsData.find(p => p.id === item.productId);
        return { ...item, product };
    });

    res.status(200).json({ success: true, data });
});

app.post('/api/wishlist', (req, res) => {
    const { email, productId } = req.body;
    if (!email || !productId) return res.status(400).json({ success: false, message: 'Email and productId are required.' });

    const index = wishlistStore.findIndex(item => item.email.toLowerCase() === email.toLowerCase() && item.productId === productId);
    if (index > -1) {
        wishlistStore.splice(index, 1);
        res.status(200).json({ success: true, message: 'Removed from wishlist', action: 'removed' });
    } else {
        wishlistStore.push({ email, productId });
        res.status(200).json({ success: true, message: 'Added to wishlist', action: 'added' });
    }
});

// ─────────────────────────────────────────────
// API: POST /api/contact
// ─────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
    const { firstName, lastName, email, phone, subject, message } = req.body;
    console.log('Received contact form submission:', { firstName, lastName, email, phone, subject, message });

    try {
        const transporter = createTransporter();

        const adminMailOptions = {
            from: email,
            to: 'kathiresan.antigraviity@gmail.com',
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <h3>New Inquiry from SecureVision Website</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        const customerMailOptions = {
            from: 'kathiresan.antigraviity@gmail.com',
            to: email,
            subject: 'Thank you for contacting SecureVision',
            text: `Hello sir/Mam I am recived your queries I am contact immediately.`
        };

        if (transporter.options.auth.user === 'YOUR_EMAIL@gmail.com') {
            console.log('SMTP Credentials not configured. Simulating email send...');
            return res.status(200).json({ success: true, message: 'Form submitted successfully (Simulated Email)' });
        }

        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(customerMailOptions);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`   GET    /api/products`);
    console.log(`   GET    /api/bookings?email=...`);
    console.log(`   PATCH  /api/bookings/:orderId/status`);
    console.log(`   POST   /api/products/inquiry`);
    console.log(`   POST   /api/contact`);
    console.log(`\n🔑 ADMIN CREDENTIALS FOR TESTING:`);
    console.log(`   Email: admin@gmail.com`);
    console.log(`   Pass:  admin123`);
});
