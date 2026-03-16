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
    modelNumber: {
        type: String,
        default: ''
    },
    resolution: {
        type: String,
        default: ''
    },
    lensSize: {
        type: String,
        default: ''
    },
    nightVisionDistance: {
        type: String,
        default: ''
    },
    warranty: {
        type: String,
        default: ''
    },
    productImage: {
        type: String,
        default: ''
    },
    productImages: {
        type: [String],
        default: []
    },
    videoUrl: {
        type: String,
        default: ''
    },
    videoPoster: {
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
