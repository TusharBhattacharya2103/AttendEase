const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// ==================== DASHBOARD ====================
// @route   GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [totalStudents, totalProfessors, totalClasses, pendingLeaves] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'professor', isActive: true }),
      Class.countDocuments({ isActive: true }),
      LeaveRequest.countDocuments({ status: 'pending' })
    ]);
    
    // Today's attendance stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });
    
    let todayPresent = 0, todayAbsent = 0, todayLeave = 0;
    todayAttendance.forEach(a => {
      a.records.forEach(r => {
        if (r.status === 'present') todayPresent++;
        else if (r.status === 'absent') todayAbsent++;
        else if (r.status === 'leave') todayLeave++;
      });
    });
    
    // Recent activity
    const recentAttendance = await Attendance.find()
      .populate('class', 'name code')
      .populate('markedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        stats: { totalStudents, totalProfessors, totalClasses, pendingLeaves },
        today: { present: todayPresent, absent: todayAbsent, leave: todayLeave },
        recentActivity: recentAttendance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== USERS ====================
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollCode: { $regex: search, $options: 'i' } },
        { professorCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('enrolledClasses', 'name code')
      .populate('teachingClasses', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({ success: true, data: users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/users
router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    
    // If student, update class enrollment
    if (user.role === 'student' && req.body.enrolledClasses) {
      await Class.updateMany(
        { _id: { $in: req.body.enrolledClasses } },
        { $addToSet: { students: user._id } }
      );
    }
    
    // If professor, update teaching classes
    if (user.role === 'professor' && req.body.teachingClasses) {
      for (const classId of req.body.teachingClasses) {
        await Class.findByIdAndUpdate(classId, { professor: user._id });
      }
    }
    
    res.status(201).json({ success: true, data: user, message: `${user.role} created successfully` });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('enrolledClasses', 'name code subject professor schedule')
      .populate('teachingClasses', 'name code subject students schedule');
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, data: user, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CLASSES ====================
// @route   GET /api/admin/classes
router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('professor', 'firstName lastName professorCode email')
      .populate('students', 'firstName lastName rollCode')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/classes
router.post('/classes', async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    
    // Update professor's teaching classes
    if (req.body.professor) {
      await User.findByIdAndUpdate(req.body.professor, {
        $addToSet: { teachingClasses: newClass._id }
      });
    }
    
    // Update students' enrolled classes
    if (req.body.students && req.body.students.length > 0) {
      await User.updateMany(
        { _id: { $in: req.body.students } },
        { $addToSet: { enrolledClasses: newClass._id } }
      );
    }
    
    res.status(201).json({ success: true, data: newClass, message: 'Class created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Class code already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/classes/:id
router.put('/classes/:id', async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('professor', 'firstName lastName')
      .populate('students', 'firstName lastName rollCode');
    
    if (!updatedClass) return res.status(404).json({ success: false, message: 'Class not found' });
    
    res.json({ success: true, data: updatedClass, message: 'Class updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/classes/:id
router.delete('/classes/:id', async (req, res) => {
  try {
    await Class.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Class deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ATTENDANCE REPORTS ====================
// @route   GET /api/admin/attendance/report
router.get('/attendance/report', async (req, res) => {
  try {
    const { classId, studentId, startDate, endDate } = req.query;
    
    let query = {};
    if (classId) query.class = classId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const attendance = await Attendance.find(query)
      .populate('class', 'name code subject')
      .populate('records.student', 'firstName lastName rollCode')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 });
    
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ==================== ENROLLMENT ====================
router.get('/classes/:id/students', async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate('students', 'firstName lastName rollCode email department semester');
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

    const enrolledIds = cls.students.map(s => s._id.toString());
    const allStudents = await User.find({ role: 'student', isActive: true }, 'firstName lastName rollCode email department semester');
    const available = allStudents.filter(s => !enrolledIds.includes(s._id.toString()));

    res.json({ success: true, data: { enrolled: cls.students, available } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/classes/:id/enroll', async (req, res) => {
  try {
    const { studentIds } = req.body;
    if (!studentIds || studentIds.length === 0)
      return res.status(400).json({ success: false, message: 'No students provided' });

    await Class.findByIdAndUpdate(req.params.id, { $addToSet: { students: { $each: studentIds } } });
    await User.updateMany({ _id: { $in: studentIds } }, { $addToSet: { enrolledClasses: req.params.id } });

    res.json({ success: true, message: `${studentIds.length} student(s) enrolled successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/classes/:id/enroll/:studentId', async (req, res) => {
  try {
    await Class.findByIdAndUpdate(req.params.id, { $pull: { students: req.params.studentId } });
    await User.findByIdAndUpdate(req.params.studentId, { $pull: { enrolledClasses: req.params.id } });

    res.json({ success: true, message: 'Student removed from class' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ==================== LEAVE REQUESTS ====================
// @route   GET /api/admin/leaves
router.get('/leaves', async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('student', 'firstName lastName rollCode')
      .populate('class', 'name code')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/leaves/:id
router.put('/leaves/:id', async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, reviewNote, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    ).populate('student', 'firstName lastName rollCode')
     .populate('class', 'name code');
    
    res.json({ success: true, data: leave, message: `Leave request ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
