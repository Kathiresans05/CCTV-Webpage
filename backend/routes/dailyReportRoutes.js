import express from 'express';
import DailyReport from '../models/DailyReport.js';
import { protect, admin, employee } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET my daily reports (Employee)
router.get('/my', protect, employee, async (req, res) => {
    try {
        const reports = await DailyReport.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET all daily reports (Admin)
router.get('/admin', protect, admin, async (req, res) => {
    try {
        const reports = await DailyReport.find({}).populate('employeeId', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST submit daily report (Employee)
router.post('/', protect, employee, async (req, res) => {
    try {
        const { workSummary, tasksCompleted, hoursWorked, date } = req.body;
        
        // Use provided date or today
        const reportDate = date || new Date().toISOString().split('T')[0];

        // Optional: Check if report for today already exists
        const existingReport = await DailyReport.findOne({ employeeId: req.user._id, date: reportDate });
        if (existingReport) {
            return res.status(400).json({ success: false, message: 'Report for today already submitted' });
        }

        const report = await DailyReport.create({
            employeeId: req.user._id,
            employeeName: req.user.name,
            workSummary,
            tasksCompleted: tasksCompleted || [],
            hoursWorked,
            date: reportDate
        });

        res.status(201).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
