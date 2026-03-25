import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                console.error('CRITICAL: JWT_SECRET is not defined in environment variables');
                return res.status(500).json({ success: false, message: 'Server configuration error' });
            }
            const decoded = jwt.verify(token, secret);

            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                console.log('User not found in DB');
            } else {
                console.log('User found:', req.user.email, 'Role:', req.user.role);
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Not authorized as an admin' });
    }
};

const employee = (req, res, next) => {
    if (req.user && (req.user.role === 'employee' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Not authorized as an employee' });
    }
};

const optionalAuth = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const secret = process.env.JWT_SECRET;
            if (token && token !== 'null' && token !== 'undefined' && secret) {
                const decoded = jwt.verify(token, secret);
                req.user = await User.findById(decoded.id).select('-password');
            }
        } catch (error) {
            console.error('Optional auth token error:', error.message);
            // Ignore error and proceed as guest
        }
    }
    next();
};

export { protect, admin, employee, optionalAuth };
