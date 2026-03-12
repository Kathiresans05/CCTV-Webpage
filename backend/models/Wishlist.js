import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    email: { type: String, required: true },
    productId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
