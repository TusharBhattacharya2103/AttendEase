const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('student', 'admin'));

// @route   GET /api/student/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate({
        path: 'enrolledClasses',
        populate: { path: 'professor', select: 'firstName lastName email' }
      });
    
    // Get attendance for all enrolled classes
    const classAttendance = await Promise.all(
      student.enrolledClasses.map(async (cls) => {
        const summary = await Attendance.getStudentSummary(student._id, cls._id);
        return {
          class: cls,
          attendance: summary
        };
      })
    );
    
    // Overall stats
    const totalPresent = classAttendance.reduce((acc, c) => acc + c.attendance.present, 0);
    const totalAbsent = classAttendance.reduce((acc, c) => acc + c.attendance.absent, 0);
    const totalLeave = classAttendance.reduce((acc, c) => acc + c.attendance.leave, 0);
    const totalClasses = classAttendance.reduce((acc, c) => acc + c.attendance.total, 0);
    const overallPercentage = totalClasses > 0 
      ? Math.round((totalPresent / totalClasses) * 100) 
      : 0;
    
    // Pending leave requests
    const pendingLeaves = await LeaveRequest.countDocuments({
      student: student._id,
      status: 'pending'
    });
    
    res.json({
      success: true,
      data: {
        student,
        classAttendance,
        overallStats: {
          totalPresent,
          totalAbsent,
          totalLeave,
          totalClasses,
          overallPercentage
        },
        pendingLeaves
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student/attendance/:classId
router.get('/attendance/:classId', async (req, res) => {
  try {
    const summary = await Attendance.getStudentSummary(req.user._id, req.params.classId);
    
    // Get detailed records
    const records = await Attendance.find({ class: req.params.classId })
      .sort({ date: -1 });
    
    const detailedRecords = records.map(a => {
      const record = a.records.find(r => r.student.toString() === req.user._id.toString());
      return record ? {
        date: a.date,
        status: record.status,
        remarks: record.remarks
      } : null;
    }).filter(Boolean);
    
    res.json({ success: true, data: { summary, records: detailedRecords } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student/schedule
router.get('/schedule', async (req, res) => {
  try {
    const classes = await Class.find({ 
      _id: { $in: req.user.enrolledClasses },
      isActive: true 
    }).populate('professor', 'firstName lastName email');
    
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/student/leave/request
router.post('/leave/request', async (req, res) => {
  try {
    const { classId, startDate, endDate, reason, type } = req.body;
    
    // Verify student is enrolled in the class
    const cls = await Class.findOne({ _id: classId, students: req.user._id });
    if (!cls) return res.status(403).json({ success: false, message: 'Not enrolled in this class' });
    
    const leave = await LeaveRequest.create({
      student: req.user._id,
      class: classId,
      startDate,
      endDate,
      reason,
      type: type || 'other'
    });
    
    res.status(201).json({ success: true, data: leave, message: 'Leave request submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student/leave/history
router.get('/leave/history', async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ student: req.user._id })
      .populate('class', 'name code')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student/profile
router.get('/profile', async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate({
        path: 'enrolledClasses',
        populate: { path: 'professor', select: 'firstName lastName email professorCode' }
      });
    
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
