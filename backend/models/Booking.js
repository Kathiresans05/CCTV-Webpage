import mongoose from 'mongoose';

const bookingSchema = mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    productId: {
        type: Number // Reference to existing product ID
    },
    productName: {
        type: String
    },
    productPrice: {
        type: Number
    },
    quantity: {
        type: Number,
        default: 1
    },
    address: {
        type: String,
        required: false
    },
    city: {
        type: String
    },
    preferredDate: {
        type: Date
    },
    preferredTime: {
        type: String
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    assignedEmployee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedEmployeeName: String,
    assignedEmployeePhone: String,
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
    proofPhoto: String,
    workNotes: String
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
