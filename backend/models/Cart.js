import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    email: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
