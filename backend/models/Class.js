const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  startTime: {
    type: String, // "09:00"
    required: true
  },
  endTime: {
    type: String, // "10:00"
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  block: {
    type: String,
    required: true
  },
  campus: {
    type: String,
    default: 'Main Campus'
  }
});

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Class code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  credits: {
    type: Number,
    default: 3
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  schedule: [scheduleSchema],
  totalClasses: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  },
  academicYear: {
    type: String // e.g., "2024-2025"
  }
}, {
  timestamps: true
});

// Auto-increment totalClasses when attendance is marked
classSchema.methods.incrementTotalClasses = async function() {
  this.totalClasses += 1;
  await this.save();
};

module.exports = mongoose.model('Class', classSchema);
