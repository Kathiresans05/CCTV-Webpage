import mongoose from 'mongoose';

const dailyReportSchema = mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    employeeName: {
        type: String,
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD for easy querying
        required: true,
        default: () => new Date().toISOString().split('T')[0]
    },
    workSummary: {
        type: String,
        required: true
    },
    tasksCompleted: [{
        type: String
    }],
    hoursWorked: {
        type: Number,
        default: 8
    },
    status: {
        type: String,
        enum: ['Submitted', 'Reviewed'],
        default: 'Submitted'
    }
}, {
    timestamps: true
});

// Compound index to prevent multiple reports per employee per day if needed
// dailyReportSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const DailyReport = mongoose.model('DailyReport', dailyReportSchema);

export default DailyReport;
