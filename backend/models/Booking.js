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
        type: String // Reference to existing product ID
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
    paymentMethod: {
        type: String, // 'cod' or 'online'
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'cod_confirmed', 'paid', 'failed'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending_schedule', 'schedule_sent', 'scheduled_confirmed', 'reschedule_requested', 'in_progress', 'completed', 'cancelled'],
        default: 'pending_schedule'
    },
    proposedDate: {
        type: Date
    },
    proposedTimeSlot: {
        type: String
    },
    customerScheduleResponse: {
        type: String
    },
    adminNote: {
        type: String
    },
    notes: {
        type: String
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
    proofPhotos: [String],
    workNotes: String
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
