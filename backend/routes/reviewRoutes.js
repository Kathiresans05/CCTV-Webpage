import express from 'express';
import Review from '../models/Review.js';
import Stock from '../models/Stock.js';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Registered customers with completed bookings)
router.post('/', protect, async (req, res) => {
    try {
        const { rating, comment, productId, bookingId } = req.body;

        // 1. Verify booking exists and is completed
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.status !== 'completed' && booking.status !== 'Completed') {
            return res.status(400).json({ success: false, message: 'You can only review after the service is completed.' });
        }

        // 2. Verify product exists in stock
        let product = await Stock.findById(productId);
        if (!product) {
            product = await Stock.findOne({ productId });
        }
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const productObjectId = product._id;

        // 3. Check if user already reviewed this booking
        const alreadyReviewed = await Review.findOne({ booking: bookingId, user: req.user._id });
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'Product already reviewed for this booking' });
        }

        // 4. Create review
        const review = await Review.create({
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
            product: productObjectId,
            booking: bookingId
        });

        // 5. Update product ratings
        const reviews = await Review.find({ product: productObjectId });
        product.numReviews = reviews.length;
        product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await product.save();

        res.status(201).json({ success: true, message: 'Review added successfully', data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:id
// @access  Public
router.get('/product/:id', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
