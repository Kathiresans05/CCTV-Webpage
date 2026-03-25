import express from 'express';
import Lead from '../models/Lead.js';
import Notification from '../models/Notification.js';
import { protect, admin, employee } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all leads (Admin sees all, Employee sees assigned to them)
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'employee') {
            query = { assignedTo: req.user._id };
        } else if (req.user.role === 'customer') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        
        const leads = await Lead.find(query).populate('assignedTo', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, data: leads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST new lead (Admin or internal logic)
router.post('/', protect, admin, async (req, res) => {
    try {
        const lead = await Lead.create(req.body);
        res.status(201).json({ success: true, data: lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT update lead (Admin can update all, Employee can update status/notes of assigned ones)
router.put('/:id', protect, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

        if (req.user.role === 'employee') {
            // Check if assigned to this employee
            if (lead.assignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to update this lead' });
            }
            // Employees can usually only update status and notes
            lead.status = req.body.status || lead.status;
            lead.notes = req.body.notes || lead.notes;
        } else if (req.user.role === 'admin') {
            // Admin can update anything, including assignment
            const previousAssignee = lead.assignedTo;
            
            lead.name = req.body.name || lead.name;
            lead.email = req.body.email || lead.email;
            lead.phone = req.body.phone || lead.phone;
            lead.company = req.body.company !== undefined ? req.body.company : lead.company;
            lead.serviceInterest = req.body.serviceInterest || lead.serviceInterest;
            lead.status = req.body.status || lead.status;
            lead.notes = req.body.notes !== undefined ? req.body.notes : lead.notes;
            lead.assignedTo = req.body.assignedTo !== undefined ? req.body.assignedTo : lead.assignedTo;

            // Notify new assignee if changed
            if (req.body.assignedTo && (!previousAssignee || previousAssignee.toString() !== req.body.assignedTo.toString())) {
                await Notification.create({
                    userId: req.body.assignedTo,
                    role: 'employee',
                    title: 'New Lead Assigned',
                    message: `You have been assigned a new lead: ${lead.name}`,
                    type: 'lead',
                    referenceId: lead._id
                });
            }
        } else {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedLead = await lead.save();
        res.json({ success: true, data: updatedLead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE a lead (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
        
        await lead.deleteOne();
        res.json({ success: true, message: 'Lead removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
