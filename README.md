# AttendEase — College Attendance Portal (MERN Stack)

A full-stack college attendance management system built with MongoDB, Express, React, and Node.js.

## 🚀 Features

### Admin
- Full CRUD for students, professors, and classes
- Dashboard with today's attendance stats and bar charts
- Attendance reports with date range filtering
- Leave request management (approve/reject)
- Search and filter users by role

### Professor
- Dashboard showing today's scheduled classes
- Mark attendance (Present / Absent / Leave) with single click per student
- **At-risk alert**: Students with 5+ consecutive absences shown in red
- Edit past attendance with date picker + reason tracking
- Leave request review for enrolled students

### Student
- Dashboard with **circular progress graphs** per class
- Overall attendance percentage ring chart
- Class-wise detailed attendance history
- Class schedule (weekly timetable view)
- Submit leave requests with type, date range, and reason

## 🏗️ Project Structure

```
attendance-portal/
├── backend/
│   ├── models/
│   │   ├── User.js          # Admin, Professor, Student schema
│   │   ├── Class.js         # Course/class schema with schedule
│   │   ├── Attendance.js    # Attendance records + edit history
│   │   └── LeaveRequest.js  # Leave application schema
│   ├── routes/
│   │   ├── auth.js          # Login, me, change-password
│   │   ├── admin.js         # Full CRUD admin routes
│   │   ├── professor.js     # Professor-specific routes
│   │   ├── student.js       # Student-specific routes
│   │   ├── classes.js       # Shared class routes
│   │   └── attendance.js    # Shared attendance routes
│   ├── middleware/
│   │   └── auth.js          # JWT protect + role authorize
│   ├── config/
│   │   └── seed.js          # Database seeder with sample data
│   └── server.js            # Express app entry point
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.js        # Auth state + axios config
        ├── components/shared/
        │   ├── Layout.js             # Sidebar + topbar layout
        │   └── CircularProgress.js  # SVG circular attendance gauge
        ├── pages/
        │   ├── LoginPage.js
        │   ├── admin/
        │   │   ├── AdminDashboard.js
        │   │   ├── AdminUsers.js
        │   │   ├── AdminClasses.js
        │   │   ├── AdminLeaves.js
        │   │   └── AdminReports.js
        │   ├── professor/
        │   │   ├── ProfessorDashboard.js
        │   │   ├── ProfessorClasses.js
        │   │   ├── ProfessorMarkAttendance.js
        │   │   └── ProfessorLeaves.js
        │   └── student/
        │       ├── StudentDashboard.js
        │       ├── StudentAttendance.js
        │       ├── StudentSchedule.js
        │       └── StudentLeave.js
        ├── App.js
        ├── index.js
        └── index.css
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### 2. Seed the Database

```bash
cd backend
node config/seed.js
```

This creates sample data with:
- 1 Admin
- 3 Professors
- 10 Students (with 30 days of attendance history)
- 4 Classes with weekly schedules

### 3. Start Backend

```bash
cd backend
npm run dev    # development with nodemon
# or
npm start      # production
```

Backend runs on: `http://localhost:5000`

### 4. Setup & Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

## 🔑 Demo Login Credentials

| Role      | Email                        | Password    |
|-----------|------------------------------|-------------|
| Admin     | admin@college.edu            | admin123    |
| Professor | priya.sharma@college.edu     | prof123     |
| Professor | amit.verma@college.edu       | prof123     |
| Professor | sunita.patel@college.edu     | prof123     |
| Student   | arjun.s@student.edu          | student123  |
| Student   | sneha.g@student.edu          | student123  |
| Student   | vikram.r@student.edu         | student123  |

> 💡 **Vikram Rao** (22CS005) has 6 consecutive absences — he will appear in red on the professor's attendance screen!

## 🎨 Design System

- **Color palette**: Deep blue-black gradients (`#0b0e1a` base)
- **Accent colors**: `#638cff` (blue), `#22d3ee` (cyan), `#4ade80` (green)
- **Typography**: Syne (display/headings) + Inter (body)
- **At-risk indicator**: Students with 5+ consecutive absences shown with red name + warning icon

## 🔒 Security

- Passwords hashed with bcryptjs (12 salt rounds)
- JWT authentication with 7-day expiry
- Role-based route protection (admin/professor/student)
- Inactive accounts blocked from login

## 📦 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router v6, Axios    |
| Charts    | Chart.js, react-chartjs-2           |
| Styling   | Pure CSS with CSS variables         |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB with Mongoose ODM           |
| Auth      | JWT + bcryptjs                      |
| Dates     | date-fns                            |
| Toasts    | react-hot-toast                     |
