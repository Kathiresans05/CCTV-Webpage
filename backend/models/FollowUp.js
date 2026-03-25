import mongoose from 'mongoose';

const followUpSchema = mongoose.Schema({
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    followUpDate: {
        type: Date,
        required: true
    },
    followUpTime: {
        type: String,
        default: '09:00 AM'
    },
    note: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Missed', 'Rescheduled'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

const FollowUp = mongoose.model('FollowUp', followUpSchema);

export default FollowUp;
