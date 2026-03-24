const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'leave'],
    required: true
  },
  remarks: {
    type: String,
    default: ''
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Track edits
  editHistory: [{
    previousStatus: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }]
});

const attendanceSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  records: [attendanceRecordSchema],
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionInfo: {
    startTime: String,
    endTime: String,
    roomNumber: String,
    block: String,
    campus: String
  },
  isFinalized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
attendanceSchema.index({ class: 1, date: 1 }, { unique: true });
attendanceSchema.index({ 'records.student': 1 });

// Static method to get student attendance summary for a class
attendanceSchema.statics.getStudentSummary = async function(studentId, classId) {
  const records = await this.find({ class: classId });
  
  let present = 0, absent = 0, leave = 0, total = 0;
  let consecutiveAbsent = 0;
  let maxConsecutive = 0;
  let lastStatus = null;

  // Sort by date
  const sorted = records.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  sorted.forEach(attendance => {
    const studentRecord = attendance.records.find(
      r => r.student.toString() === studentId.toString()
    );
    if (studentRecord) {
      total++;
      if (studentRecord.status === 'present') {
        present++;
        consecutiveAbsent = 0;
      } else if (studentRecord.status === 'absent') {
        absent++;
        consecutiveAbsent++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveAbsent);
      } else if (studentRecord.status === 'leave') {
        leave++;
        consecutiveAbsent = 0;
      }
      lastStatus = studentRecord.status;
    }
  });

  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  
  return {
    present,
    absent,
    leave,
    total,
    percentage,
    consecutiveAbsent: consecutiveAbsent,
    maxConsecutiveAbsent: maxConsecutive,
    isAtRisk: consecutiveAbsent >= 5
  };
};

module.exports = mongoose.model('Attendance', attendanceSchema);
