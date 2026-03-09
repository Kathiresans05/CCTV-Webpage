import mongoose from 'mongoose';

const stockSchema = mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },
    productName: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    reorderLevel: {
        type: Number,
        default: 5
    },
    description: {
        type: String,
        default: ''
    },
    productImage: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['instock', 'lowstock', 'outofstock'],
        default: 'instock'
    }
}, {
    timestamps: true
});

const Stock = mongoose.model('Stock', stockSchema);

export default Stock;
