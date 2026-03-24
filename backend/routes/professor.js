const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('professor', 'admin'));

// @route   GET /api/professor/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const professorId = req.user._id;
    
    const classes = await Class.find({ professor: professorId, isActive: true })
      .populate('students', 'firstName lastName rollCode');
    
    // Get today's classes
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    const todayClasses = classes.filter(c => 
      c.schedule.some(s => s.day === dayName)
    ).map(c => ({
      ...c.toObject(),
      todaySchedule: c.schedule.filter(s => s.day === dayName)
    }));
    
    // Check which today's classes have attendance marked
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    const markedToday = await Attendance.find({
      class: { $in: classes.map(c => c._id) },
      date: { $gte: todayStart, $lte: todayEnd }
    });
    
    const markedClassIds = markedToday.map(a => a.class.toString());
    
    res.json({
      success: true,
      data: {
        totalClasses: classes.length,
        totalStudents: classes.reduce((acc, c) => acc + c.students.length, 0),
        todayClasses: todayClasses.map(c => ({
          ...c,
          attendanceMarked: markedClassIds.includes(c._id.toString())
        })),
        classes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/professor/classes
router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find({ professor: req.user._id, isActive: true })
      .populate({
        path: 'students',
        select: 'firstName lastName rollCode email mobile parentMobile'
      });
    
    // Add attendance summary per class
    const classesWithStats = await Promise.all(classes.map(async (cls) => {
      const attendanceCount = await Attendance.countDocuments({ class: cls._id });
      return { ...cls.toObject(), totalAttendanceDays: attendanceCount };
    }));
    
    res.json({ success: true, data: classesWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/professor/classes/:classId/students
router.get('/classes/:classId/students', async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.classId, professor: req.user._id })
      .populate('students', 'firstName lastName rollCode email mobile parentMobile');
    
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    
    // Get attendance summary for each student
    const studentsWithAttendance = await Promise.all(cls.students.map(async (student) => {
      const summary = await Attendance.getStudentSummary(student._id, cls._id);
      return { ...student.toObject(), attendance: summary };
    }));
    
    res.json({ success: true, data: { class: cls, students: studentsWithAttendance } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/professor/attendance/mark
router.post('/attendance/mark', async (req, res) => {
  try {
    const { classId, date, records, sessionInfo } = req.body;
    
    const cls = await Class.findOne({ _id: classId, professor: req.user._id });
    if (!cls) return res.status(403).json({ success: false, message: 'Not authorized for this class' });
    
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    // Check if already exists
    let attendance = await Attendance.findOne({ class: classId, date: attendanceDate });
    
    if (attendance) {
      // Update existing
      attendance.records = records.map(r => ({
        ...r,
        markedBy: req.user._id
      }));
      attendance.sessionInfo = sessionInfo;
      await attendance.save();
    } else {
      // Create new
      attendance = await Attendance.create({
        class: classId,
        date: attendanceDate,
        records: records.map(r => ({ ...r, markedBy: req.user._id })),
        markedBy: req.user._id,
        sessionInfo
      });
      
      // Increment total classes
      await Class.findByIdAndUpdate(classId, { $inc: { totalClasses: 1 } });
    }
    
    res.json({ success: true, data: attendance, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/professor/attendance/edit
// Edit attendance for a past date
router.put('/attendance/edit', async (req, res) => {
  try {
    const { classId, date, studentId, newStatus, reason } = req.body;
    
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({ class: classId, date: attendanceDate });
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance record not found' });
    
    const record = attendance.records.find(r => r.student.toString() === studentId);
    if (!record) return res.status(404).json({ success: false, message: 'Student record not found' });
    
    // Add to edit history
    record.editHistory.push({
      previousStatus: record.status,
      changedBy: req.user._id,
      reason: reason || 'Manual correction'
    });
    
    record.status = newStatus;
    record.markedBy = req.user._id;
    
    await attendance.save();
    
    res.json({ success: true, data: attendance, message: 'Attendance updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/professor/attendance/:classId
router.get('/attendance/:classId', async (req, res) => {
  try {
    const { date } = req.query;
    let query = { class: req.params.classId };
    
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }
    
    const attendance = await Attendance.find(query)
      .populate('records.student', 'firstName lastName rollCode')
      .sort({ date: -1 });
    
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/professor/leaves
router.get('/leaves', async (req, res) => {
  try {
    const professorClasses = await Class.find({ professor: req.user._id }, '_id');
    const classIds = professorClasses.map(c => c._id);
    
    const leaves = await LeaveRequest.find({ class: { $in: classIds } })
      .populate('student', 'firstName lastName rollCode')
      .populate('class', 'name code')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/professor/leaves/:id
router.put('/leaves/:id', async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, reviewNote, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    ).populate('student', 'firstName lastName rollCode')
     .populate('class', 'name code');
    
    res.json({ success: true, data: leave, message: `Leave ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
