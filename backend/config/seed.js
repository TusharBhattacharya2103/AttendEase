const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_portal';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');
    
    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');
    
    // Create Admin
    const admin = await User.create({
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
      mobile: '9876543210',
      address: '123, College Road, New Delhi - 110001'
    });
    
    // Create Professors
    const professors = await User.create([
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@college.edu',
        password: 'prof123',
        role: 'professor',
        mobile: '9876543211',
        address: '45, Faculty Quarters, Block A',
        professorCode: 'PROF001',
        department: 'Computer Science',
        qualification: 'Ph.D Computer Science',
        specialization: 'Machine Learning'
      },
      {
        firstName: 'Amit',
        lastName: 'Verma',
        email: 'amit.verma@college.edu',
        password: 'prof123',
        role: 'professor',
        mobile: '9876543212',
        address: '67, Faculty Quarters, Block B',
        professorCode: 'PROF002',
        department: 'Computer Science',
        qualification: 'M.Tech',
        specialization: 'Web Development'
      },
      {
        firstName: 'Sunita',
        lastName: 'Patel',
        email: 'sunita.patel@college.edu',
        password: 'prof123',
        role: 'professor',
        mobile: '9876543213',
        address: '89, Faculty Quarters, Block C',
        professorCode: 'PROF003',
        department: 'Mathematics',
        qualification: 'Ph.D Mathematics',
        specialization: 'Discrete Mathematics'
      }
    ]);
    
    // Create Classes
    const classes = await Class.create([
      {
        name: 'Data Structures & Algorithms',
        code: 'CS301',
        subject: 'Data Structures',
        department: 'Computer Science',
        semester: 3,
        credits: 4,
        professor: professors[0]._id,
        academicYear: '2024-2025',
        schedule: [
          { day: 'Monday', startTime: '09:00', endTime: '10:00', roomNumber: 'LH-101', block: 'A', campus: 'Main Campus' },
          { day: 'Wednesday', startTime: '09:00', endTime: '10:00', roomNumber: 'LH-101', block: 'A', campus: 'Main Campus' },
          { day: 'Friday', startTime: '11:00', endTime: '12:00', roomNumber: 'Lab-201', block: 'B', campus: 'Main Campus' }
        ]
      },
      {
        name: 'Web Technology',
        code: 'CS302',
        subject: 'Web Development',
        department: 'Computer Science',
        semester: 3,
        credits: 3,
        professor: professors[1]._id,
        academicYear: '2024-2025',
        schedule: [
          { day: 'Tuesday', startTime: '10:00', endTime: '11:00', roomNumber: 'LH-102', block: 'A', campus: 'Main Campus' },
          { day: 'Thursday', startTime: '10:00', endTime: '11:00', roomNumber: 'LH-102', block: 'A', campus: 'Main Campus' }
        ]
      },
      {
        name: 'Discrete Mathematics',
        code: 'MA301',
        subject: 'Mathematics',
        department: 'Mathematics',
        semester: 3,
        credits: 4,
        professor: professors[2]._id,
        academicYear: '2024-2025',
        schedule: [
          { day: 'Monday', startTime: '11:00', endTime: '12:00', roomNumber: 'LH-201', block: 'C', campus: 'Main Campus' },
          { day: 'Wednesday', startTime: '11:00', endTime: '12:00', roomNumber: 'LH-201', block: 'C', campus: 'Main Campus' },
          { day: 'Friday', startTime: '09:00', endTime: '10:00', roomNumber: 'LH-201', block: 'C', campus: 'Main Campus' }
        ]
      },
      {
        name: 'Operating Systems',
        code: 'CS303',
        subject: 'OS Fundamentals',
        department: 'Computer Science',
        semester: 3,
        credits: 4,
        professor: professors[0]._id,
        academicYear: '2024-2025',
        schedule: [
          { day: 'Tuesday', startTime: '14:00', endTime: '15:00', roomNumber: 'LH-103', block: 'A', campus: 'Main Campus' },
          { day: 'Thursday', startTime: '14:00', endTime: '15:00', roomNumber: 'LH-103', block: 'A', campus: 'Main Campus' }
        ]
      }
    ]);
    
    // Update professors' teaching classes
    await User.findByIdAndUpdate(professors[0]._id, { 
      teachingClasses: [classes[0]._id, classes[3]._id] 
    });
    await User.findByIdAndUpdate(professors[1]._id, { 
      teachingClasses: [classes[1]._id] 
    });
    await User.findByIdAndUpdate(professors[2]._id, { 
      teachingClasses: [classes[2]._id] 
    });
    
    // Create Students
    const studentData = [
      { firstName: 'Arjun', lastName: 'Singh', email: 'arjun.s@student.edu', rollCode: '22CS001', mobile: '9001234567', parentMobile: '9001234500' },
      { firstName: 'Sneha', lastName: 'Gupta', email: 'sneha.g@student.edu', rollCode: '22CS002', mobile: '9001234568', parentMobile: '9001234501' },
      { firstName: 'Rahul', lastName: 'Mehta', email: 'rahul.m@student.edu', rollCode: '22CS003', mobile: '9001234569', parentMobile: '9001234502' },
      { firstName: 'Anjali', lastName: 'Joshi', email: 'anjali.j@student.edu', rollCode: '22CS004', mobile: '9001234570', parentMobile: '9001234503' },
      { firstName: 'Vikram', lastName: 'Rao', email: 'vikram.r@student.edu', rollCode: '22CS005', mobile: '9001234571', parentMobile: '9001234504' },
      { firstName: 'Kavita', lastName: 'Nair', email: 'kavita.n@student.edu', rollCode: '22CS006', mobile: '9001234572', parentMobile: '9001234505' },
      { firstName: 'Rohan', lastName: 'Das', email: 'rohan.d@student.edu', rollCode: '22CS007', mobile: '9001234573', parentMobile: '9001234506' },
      { firstName: 'Pooja', lastName: 'Mishra', email: 'pooja.m@student.edu', rollCode: '22CS008', mobile: '9001234574', parentMobile: '9001234507' },
      { firstName: 'Karthik', lastName: 'Iyer', email: 'karthik.i@student.edu', rollCode: '22CS009', mobile: '9001234575', parentMobile: '9001234508' },
      { firstName: 'Divya', lastName: 'Reddy', email: 'divya.r@student.edu', rollCode: '22CS010', mobile: '9001234576', parentMobile: '9001234509' }
    ];
    
    const students = await User.create(studentData.map(s => ({
      ...s,
      password: 'student123',
      role: 'student',
      department: 'Computer Science',
      semester: 3,
      batch: '2022-2026',
      enrolledClasses: [classes[0]._id, classes[1]._id, classes[2]._id, classes[3]._id]
    })));
    
    // Update classes with students
    const studentIds = students.map(s => s._id);
    await Class.updateMany(
      { _id: { $in: [classes[0]._id, classes[1]._id, classes[2]._id, classes[3]._id] } },
      { $set: { students: studentIds } }
    );
    
    // Generate sample attendance for last 30 days
    const today = new Date();
    
    for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
      const attendanceDate = new Date(today);
      attendanceDate.setDate(attendanceDate.getDate() - dayOffset);
      attendanceDate.setHours(0, 0, 0, 0);
      
      const dayName = attendanceDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      for (const cls of classes) {
        const hasClassToday = cls.schedule.some(s => s.day === dayName);
        if (!hasClassToday) continue;
        
        // Random attendance with some students having streaks
        const records = students.map((student, idx) => {
          let status;
          // Make student at index 4 (Vikram) have 6 consecutive absences recently
          if (idx === 4 && dayOffset <= 6) {
            status = 'absent';
          } else {
            const rand = Math.random();
            if (rand < 0.75) status = 'present';
            else if (rand < 0.90) status = 'absent';
            else status = 'leave';
          }
          return { student: student._id, status, markedBy: cls.professor };
        });
        
        try {
          await Attendance.create({
            class: cls._id,
            date: attendanceDate,
            records,
            markedBy: cls.professor,
            sessionInfo: cls.schedule.find(s => s.day === dayName) || {}
          });
        } catch(e) {
          // Skip duplicates
        }
      }
    }
    
    // Update total classes count
    for (const cls of classes) {
      const count = await Attendance.countDocuments({ class: cls._id });
      await Class.findByIdAndUpdate(cls._id, { totalClasses: count });
    }
    
    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ADMIN:');
    console.log('  Email: admin@college.edu');
    console.log('  Password: admin123');
    console.log('\nPROFESSORS:');
    console.log('  Email: priya.sharma@college.edu | Password: prof123');
    console.log('  Email: amit.verma@college.edu   | Password: prof123');
    console.log('  Email: sunita.patel@college.edu | Password: prof123');
    console.log('\nSTUDENTS:');
    console.log('  Email: arjun.s@student.edu | Password: student123');
    console.log('  Email: sneha.g@student.edu | Password: student123');
    console.log('  (and 8 more students with pattern: password = student123)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
