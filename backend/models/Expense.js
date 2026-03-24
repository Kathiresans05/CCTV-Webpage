import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Travel', 'Materials', 'Food', 'Others']
    },
    description: {
        type: String,
        required: true
    },
    receiptImage: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminNote: {
        type: String
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date
    }
}, {
    timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
