import express from 'express';
import FollowUp from '../models/FollowUp.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all follow-ups (Admin: all, Employee: assigned)
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'employee') {
            query = { assignedTo: req.user._id };
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const followUps = await FollowUp.find(query)
            .populate('leadId', 'name phone email company serviceInterest')
            .populate('assignedTo', 'name email')
            .sort({ followUpDate: 1 });

        res.json({ success: true, data: followUps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a follow-up
router.post('/', protect, async (req, res) => {
    try {
        const { leadId, assignedTo, followUpDate, followUpTime, note } = req.body;
        
        const followUp = await FollowUp.create({
            leadId,
            assignedTo: assignedTo || req.user._id,
            followUpDate,
            followUpTime,
            note
        });

        res.status(201).json({ success: true, data: followUp });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update follow-up status
router.patch('/:id', protect, async (req, res) => {
    try {
        const { status, note } = req.body;
        const followUp = await FollowUp.findById(req.params.id);

        if (!followUp) {
            return res.status(404).json({ success: false, message: 'Follow-up not found' });
        }

        // Authorization: Admin or the assigned Employee
        if (req.user.role !== 'admin' && followUp.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        followUp.status = status || followUp.status;
        if (note) followUp.note = note;

        const updatedFollowUp = await followUp.save();
        res.json({ success: true, data: updatedFollowUp });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete follow-up (Admin only or owner?)
router.delete('/:id', protect, async (req, res) => {
    try {
        const followUp = await FollowUp.findById(req.params.id);
        if (!followUp) return res.status(404).json({ success: false, message: 'Not found' });

        if (req.user.role !== 'admin' && followUp.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await FollowUp.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Follow-up deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
