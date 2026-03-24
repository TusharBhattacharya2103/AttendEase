const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/attendance/class/:classId
router.get('/class/:classId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { class: req.params.classId };
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const attendance = await Attendance.find(query)
      .populate('records.student', 'firstName lastName rollCode')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 });
    
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/attendance/student/:studentId/class/:classId
router.get('/student/:studentId/class/:classId', async (req, res) => {
  try {
    const summary = await Attendance.getStudentSummary(req.params.studentId, req.params.classId);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
