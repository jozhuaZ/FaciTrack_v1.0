const express = require('express');
const router = express.Router();

// Admin Login
router.get('/login', (req, res) => {
    res.render('pages/admin/login', { title: 'FaciTrack - Administrator Login', error: null });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const admins = [{ email: 'admin@my.cspc.edu.ph', password: 'admin123' }];
    const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (admin) {
        res.redirect('/admin/dashboard');
    } else {
        res.render('pages/admin/login', { title: 'FaciTrack - Administrator Login', error: 'Invalid email or password.' });
    }
});

function getSharedData() {
    const admin = {
        name: 'System Administrator',
        role: 'Administrator',
        email: 'admin@my.cspc.edu.ph'
    };

    const faculty = [
        { id: 1, name: 'Dr. Maria Santos', position: 'Professor', department: 'College of Computer Studies', officeRoom: 'CCS Building, Room 201', bleStatus: 'in-room', bleLastDetected: '2 minutes ago', hoursThisMonth: 48, consultationsThisMonth: 32, avgDuration: '42 min' },
        { id: 2, name: 'Prof. Jose Dela Cruz', position: 'Associate Professor', department: 'College of Computer Studies', officeRoom: 'CCS Building, Room 105', bleStatus: 'out-of-room', bleLastDetected: '1 hour ago', hoursThisMonth: 36, consultationsThisMonth: 24, avgDuration: '38 min' },
        { id: 3, name: 'Dr. Ana Villanueva', position: 'Assistant Professor', department: 'College of Computer Studies', officeRoom: 'CCS Building, Room 203', bleStatus: 'in-room', bleLastDetected: '5 minutes ago', hoursThisMonth: 42, consultationsThisMonth: 28, avgDuration: '45 min' },
        { id: 4, name: 'Prof. Carlos Bautista', position: 'Instructor', department: 'College of Computer Studies', officeRoom: 'CCS Building, Room 102', bleStatus: 'out-of-room', bleLastDetected: '3 hours ago', hoursThisMonth: 30, consultationsThisMonth: 18, avgDuration: '35 min' },
        { id: 5, name: 'Dr. Ramon Aquino', position: 'Associate Professor', department: 'College of Computer Studies', officeRoom: 'CCS Building, Room 204', bleStatus: 'in-room', bleLastDetected: '10 minutes ago', hoursThisMonth: 40, consultationsThisMonth: 22, avgDuration: '40 min' },
        { id: 6, name: 'Prof. Liza Navarro', position: 'Instructor', department: 'College of Computer Studies', officeRoom: 'CCS Building, Room 106', bleStatus: 'in-room', bleLastDetected: '8 minutes ago', hoursThisMonth: 28, consultationsThisMonth: 15, avgDuration: '33 min' },
        { id: 7, name: 'Dr. Eduardo Flores', position: 'Professor', department: 'College of Computer Studies', officeRoom: 'CCS Building, Room 202', bleStatus: 'in-room', bleLastDetected: '3 minutes ago', hoursThisMonth: 44, consultationsThisMonth: 30, avgDuration: '44 min' },
        { id: 8, name: 'Prof. Grace Mendoza', position: 'Assistant Professor', department: 'College of Computer Studies', officeRoom: 'CCS Building, Room 107', bleStatus: 'out-of-room', bleLastDetected: '2 hours ago', hoursThisMonth: 32, consultationsThisMonth: 20, avgDuration: '36 min' },
        { id: 9, name: 'Dr. Benjamin Reyes', position: 'Associate Professor', department: 'College of Computer Studies', officeRoom: 'CCS Building, Room 205', bleStatus: 'in-room', bleLastDetected: '15 minutes ago', hoursThisMonth: 38, consultationsThisMonth: 25, avgDuration: '39 min' },
        { id: 10, name: 'Prof. Maricel Castro', position: 'Instructor', department: 'College of Computer Studies', officeRoom: 'CCS Building, Room 103', bleStatus: 'out-of-room', bleLastDetected: '4 hours ago', hoursThisMonth: 26, consultationsThisMonth: 14, avgDuration: '32 min' }
    ];

    const allAppointments = [
        { id: 1, studentName: 'Juan Dela Cruz', studentId: '2021-00123', instructorName: 'Dr. Maria Santos', date: 'March 24, 2026', time: '2:00 PM', duration: '30 minutes', topic: 'Thesis consultation regarding system architecture', status: 'pending' },
        { id: 2, studentName: 'Ana Reyes', studentId: '2021-00456', instructorName: 'Dr. Maria Santos', date: 'March 25, 2026', time: '10:00 AM', duration: '30 minutes', topic: 'Grade inquiry for Midterm exam', status: 'pending' },
        { id: 3, studentName: 'Carlos Mendoza', studentId: '2021-00789', instructorName: 'Dr. Maria Santos', date: 'March 24, 2026', time: '3:30 PM', duration: '45 minutes', topic: 'Project proposal review', status: 'confirmed' },
        { id: 4, studentName: 'Maria Garcia', studentId: '2021-00321', instructorName: 'Prof. Jose Dela Cruz', date: 'March 22, 2026', time: '1:00 PM', duration: '30 minutes', topic: 'Academic advising', status: 'declined' },
        { id: 5, studentName: 'Pedro Lim', studentId: '2022-00111', instructorName: 'Dr. Ana Villanueva', date: 'March 24, 2026', time: '9:00 AM', duration: '30 minutes', topic: 'Research methodology guidance', status: 'confirmed' },
        { id: 6, studentName: 'Rosa Fernandez', studentId: '2022-00222', instructorName: 'Prof. Carlos Bautista', date: 'March 25, 2026', time: '11:00 AM', duration: '45 minutes', topic: 'Capstone project feedback', status: 'pending' },
        { id: 7, studentName: 'Luis Torres', studentId: '2021-00555', instructorName: 'Dr. Ana Villanueva', date: 'March 23, 2026', time: '2:00 PM', duration: '30 minutes', topic: 'Grade reconsideration request', status: 'confirmed' },
        { id: 8, studentName: 'Kristine Uy', studentId: '2022-00333', instructorName: 'Dr. Ramon Aquino', date: 'March 24, 2026', time: '1:00 PM', duration: '30 minutes', topic: 'AI project consultation', status: 'confirmed' },
        { id: 9, studentName: 'Mark Villanueva', studentId: '2022-00444', instructorName: 'Prof. Liza Navarro', date: 'March 25, 2026', time: '2:00 PM', duration: '45 minutes', topic: 'Web app debugging session', status: 'pending' },
        { id: 10, studentName: 'Sheila Ramos', studentId: '2021-00666', instructorName: 'Dr. Eduardo Flores', date: 'March 24, 2026', time: '3:00 PM', duration: '30 minutes', topic: 'Network security thesis review', status: 'confirmed' },
        { id: 11, studentName: 'Jerome Pascual', studentId: '2022-00555', instructorName: 'Prof. Grace Mendoza', date: 'March 26, 2026', time: '10:00 AM', duration: '30 minutes', topic: 'Mobile app UI feedback', status: 'pending' },
        { id: 12, studentName: 'Diane Soriano', studentId: '2021-00777', instructorName: 'Dr. Benjamin Reyes', date: 'March 24, 2026', time: '11:00 AM', duration: '45 minutes', topic: 'Data science capstone guidance', status: 'confirmed' },
        { id: 13, studentName: 'Ryan Ocampo', studentId: '2022-00666', instructorName: 'Prof. Maricel Castro', date: 'March 25, 2026', time: '1:00 PM', duration: '30 minutes', topic: 'System design review', status: 'pending' }
    ];

    const presenceLogs = [
        { facultyName: 'Dr. Maria Santos', timestamp: '2026-03-17 09:15 AM', status: 'entered', location: 'CCS Building, Room 201', duration: null },
        { facultyName: 'Dr. Maria Santos', timestamp: '2026-03-17 11:30 AM', status: 'exited', location: 'CCS Building, Room 201', duration: '2h 15m' },
        { facultyName: 'Dr. Ana Villanueva', timestamp: '2026-03-17 08:45 AM', status: 'entered', location: 'CCS Building, Room 203', duration: null },
        { facultyName: 'Prof. Jose Dela Cruz', timestamp: '2026-03-17 09:00 AM', status: 'entered', location: 'CCS Building, Room 105', duration: null },
        { facultyName: 'Prof. Jose Dela Cruz', timestamp: '2026-03-17 10:00 AM', status: 'exited', location: 'CCS Building, Room 105', duration: '1h 0m' },
        { facultyName: 'Dr. Maria Santos', timestamp: '2026-03-17 01:00 PM', status: 'entered', location: 'CCS Building, Room 201', duration: null },
        { facultyName: 'Prof. Carlos Bautista', timestamp: '2026-03-17 07:30 AM', status: 'entered', location: 'CCS Building, Room 102', duration: null },
        { facultyName: 'Prof. Carlos Bautista', timestamp: '2026-03-17 10:30 AM', status: 'exited', location: 'CCS Building, Room 102', duration: '3h 0m' },
        { facultyName: 'Dr. Ramon Aquino', timestamp: '2026-03-17 08:00 AM', status: 'entered', location: 'CCS Building, Room 204', duration: null },
        { facultyName: 'Dr. Ramon Aquino', timestamp: '2026-03-17 11:00 AM', status: 'exited', location: 'CCS Building, Room 204', duration: '3h 0m' },
        { facultyName: 'Prof. Liza Navarro', timestamp: '2026-03-17 09:30 AM', status: 'entered', location: 'CCS Building, Room 106', duration: null },
        { facultyName: 'Dr. Eduardo Flores', timestamp: '2026-03-17 08:30 AM', status: 'entered', location: 'CCS Building, Room 202', duration: null },
        { facultyName: 'Prof. Grace Mendoza', timestamp: '2026-03-17 07:45 AM', status: 'entered', location: 'CCS Building, Room 107', duration: null },
        { facultyName: 'Prof. Grace Mendoza', timestamp: '2026-03-17 09:45 AM', status: 'exited', location: 'CCS Building, Room 107', duration: '2h 0m' },
        { facultyName: 'Dr. Benjamin Reyes', timestamp: '2026-03-17 10:00 AM', status: 'entered', location: 'CCS Building, Room 205', duration: null },
        { facultyName: 'Prof. Maricel Castro', timestamp: '2026-03-17 07:00 AM', status: 'entered', location: 'CCS Building, Room 103', duration: null },
        { facultyName: 'Prof. Maricel Castro', timestamp: '2026-03-17 11:00 AM', status: 'exited', location: 'CCS Building, Room 103', duration: '4h 0m' }
    ];

    const users = [
        { id: 1, name: 'Dr. Maria Santos', email: 'msantos@my.cspc.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'active', lastLogin: 'Mar 17, 2026 08:45 AM' },
        { id: 2, name: 'Prof. Jose Dela Cruz', email: 'jdelacruz@my.cspc.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'active', lastLogin: 'Mar 17, 2026 09:00 AM' },
        { id: 3, name: 'Dr. Ana Villanueva', email: 'avillanueva@my.cspc.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'active', lastLogin: 'Mar 17, 2026 08:30 AM' },
        { id: 4, name: 'Prof. Carlos Bautista', email: 'cbautista@my.cspc.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'active', lastLogin: 'Mar 16, 2026 04:00 PM' },
        { id: 5, name: 'Dr. Ramon Aquino', email: 'raquino@my.cspc.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'active', lastLogin: 'Mar 17, 2026 07:55 AM' },
        { id: 6, name: 'Prof. Liza Navarro', email: 'lnavarro@my.cspc.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'active', lastLogin: 'Mar 17, 2026 09:25 AM' },
        { id: 7, name: 'Dr. Eduardo Flores', email: 'eflores@my.cspc.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'active', lastLogin: 'Mar 17, 2026 08:20 AM' },
        { id: 8, name: 'Prof. Grace Mendoza', email: 'gmendoza@my.cspc.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'inactive', lastLogin: 'Mar 15, 2026 02:00 PM' },
        { id: 9, name: 'Dr. Benjamin Reyes', email: 'breyes@my.cspc.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'active', lastLogin: 'Mar 17, 2026 09:50 AM' },
        { id: 10, name: 'Prof. Maricel Castro', email: 'mcastro@my.cspc.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'active', lastLogin: 'Mar 16, 2026 05:30 PM' },
        { id: 11, name: 'Dr. Lourdes Reyes', email: 'dean@my.cspc.edu.ph', role: 'Dean', department: 'College of Computer Studies', status: 'active', lastLogin: 'Mar 17, 2026 07:30 AM' },
        { id: 12, name: 'System Administrator', email: 'admin@my.cspc.edu.ph', role: 'Admin', department: 'CSPC IT Office', status: 'active', lastLogin: 'Mar 17, 2026 06:00 AM' }
    ];

    const logs = [
        { user: 'Dr. Maria Santos', role: 'Instructor', action: 'Logged into the system', type: 'login', ip: '192.168.1.101', timestamp: 'Mar 17, 2026 08:45 AM', isToday: true },
        { user: 'Dr. Lourdes Reyes', role: 'Dean', action: 'Logged into the system', type: 'login', ip: '192.168.1.50', timestamp: 'Mar 17, 2026 07:30 AM', isToday: true },
        { user: 'System Administrator', role: 'Admin', action: 'Updated system settings', type: 'update', ip: '192.168.1.10', timestamp: 'Mar 17, 2026 06:15 AM', isToday: true },
        { user: 'Prof. Jose Dela Cruz', role: 'Instructor', action: 'Logged into the system', type: 'login', ip: '192.168.1.102', timestamp: 'Mar 17, 2026 09:00 AM', isToday: true },
        { user: 'Dr. Ana Villanueva', role: 'Instructor', action: 'Updated consultation schedule', type: 'update', ip: '192.168.1.103', timestamp: 'Mar 17, 2026 08:35 AM', isToday: true },
        { user: 'System Administrator', role: 'Admin', action: 'Created new user account: Prof. Maricel Castro', type: 'create', ip: '192.168.1.10', timestamp: 'Mar 16, 2026 03:00 PM', isToday: false },
        { user: 'Dr. Ramon Aquino', role: 'Instructor', action: 'Logged into the system', type: 'login', ip: '192.168.1.105', timestamp: 'Mar 17, 2026 07:55 AM', isToday: true },
        { user: 'Prof. Grace Mendoza', role: 'Instructor', action: 'Logged out of the system', type: 'logout', ip: '192.168.1.108', timestamp: 'Mar 15, 2026 02:00 PM', isToday: false },
        { user: 'System Administrator', role: 'Admin', action: 'Deactivated account: Prof. Grace Mendoza', type: 'update', ip: '192.168.1.10', timestamp: 'Mar 15, 2026 02:05 PM', isToday: false },
        { user: 'Dr. Eduardo Flores', role: 'Instructor', action: 'Logged into the system', type: 'login', ip: '192.168.1.107', timestamp: 'Mar 17, 2026 08:20 AM', isToday: true }
    ];

    const settings = [
        { label: 'System Name', value: 'FaciTrack' },
        { label: 'Institution', value: 'Camarines Sur Polytechnic Colleges' },
        { label: 'College / Department', value: 'College of Computer Studies' },
        { label: 'Academic Year', value: '2025–2026' },
        { label: 'BLE Scan Interval (seconds)', value: '30' },
        { label: 'BLE Signal Threshold (RSSI)', value: '-75 dBm' },
        { label: 'Presence Timeout (minutes)', value: '10' },
        { label: 'Auto-Refresh Interval (seconds)', value: '30' },
        { label: 'Max Appointment Duration (minutes)', value: '60' },
        { label: 'Appointment Booking Window (days)', value: '7' }
    ];

    const toggles = [
        { label: 'BLE Real-Time Monitoring', description: 'Enable live faculty presence detection via BLE beacons.', enabled: true },
        { label: 'Public Display Screen', description: 'Show faculty availability on the public monitor outside the faculty lounge.', enabled: true },
        { label: 'Student Appointment Booking', description: 'Allow students to book consultation appointments online.', enabled: true },
        { label: 'Email Notifications', description: 'Send email alerts for appointment confirmations and reminders.', enabled: false },
        { label: 'Audit Logging', description: 'Record all user actions and system events for security review.', enabled: true }
    ];

    return { admin, users, logs, settings, toggles, faculty, allAppointments, presenceLogs };
}

router.get('/dashboard', (req, res) => {
    const data = getSharedData();
    res.render('pages/admin/dashboard', { title: 'FaciTrack - Admin Dashboard', ...data });
});

router.get('/users', (req, res) => {
    const data = getSharedData();
    res.render('pages/admin/users', { title: 'FaciTrack - User Accounts', ...data });
});

router.get('/logs', (req, res) => {
    const data = getSharedData();
    res.render('pages/admin/logs', { title: 'FaciTrack - Audit Logs', ...data });
});

router.get('/settings', (req, res) => {
    const data = getSharedData();
    res.render('pages/admin/settings', { title: 'FaciTrack - System Settings', ...data });
});

router.get('/monitoring', (req, res) => {
    const data = getSharedData();
    res.render('pages/admin/monitoring', { title: 'FaciTrack - Monitoring Logs', ...data });
});

router.get('/appointments', (req, res) => {
    const data = getSharedData();
    res.render('pages/admin/appointments', { title: 'FaciTrack - Appointments', ...data });
});

router.get('/reports', (req, res) => {
    const data = getSharedData();
    res.render('pages/admin/reports', { title: 'FaciTrack - Reports', ...data });
});

module.exports = router;
