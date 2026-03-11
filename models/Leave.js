import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeName: String,
    leaveType: {
        type: String,
        enum: ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity/Paternity', 'Other'],
        default: 'Casual Leave'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    adminNotes: String
}, {
    timestamps: true
});

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
