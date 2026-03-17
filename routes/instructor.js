const express = require('express');
const router = express.Router();

// Instructor Login page
router.get('/login', (req, res) => {
    res.render('pages/instructor/login', { 
        title: 'FaciTrack - Instructor Login',
        error: null 
    });
});

// Instructor Login POST handler
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Simulated credentials for prototype
    const instructors = [
        { email: 'instructor@my.cspc.edu.ph', password: 'instructor123' },
        { email: 'maria.santos@my.cspc.edu.ph', password: 'instructor123' }
    ];
    
    // Check credentials
    const instructor = instructors.find(i => 
        i.email.toLowerCase() === email.toLowerCase() && 
        i.password === password
    );
    
    if (instructor) {
        res.redirect('/instructor/dashboard');
    } else {
        res.render('pages/instructor/login', { 
            title: 'FaciTrack - Instructor Login',
            error: 'Invalid email or password.' 
        });
    }
});

// Instructor Dashboard
router.get('/dashboard', (req, res) => {
    const data = getSharedData();
    res.render('pages/instructor/dashboard', {
        title: 'FaciTrack - Instructor Dashboard',
        ...data
    });
});

// Helper: shared data
function getSharedData() {
    const instructor = {
        id: 1,
        name: 'Dr. Maria Santos',
        email: 'maria.santos@my.cspc.edu.ph',
        position: 'Professor',
        department: 'College of Computer Studies',
        specialization: 'Software Engineering',
        officeRoom: 'CCS Building, Room 201',
        bleStatus: 'in-room',
        bleLastDetected: '2 minutes ago',
        statusOverride: false,
        profilePhoto: null // null = show initials, set to '/uploads/profile.jpg' when uploaded
    };

    const appointments = [
        { id: 1, studentName: 'Juan Dela Cruz', studentId: '2021-00123', date: 'March 24, 2026', time: '2:00 PM', duration: '30 minutes', topic: 'Thesis consultation regarding system architecture', status: 'pending', isToday: true, requestedAt: '1 hour ago' },
        { id: 2, studentName: 'Ana Reyes', studentId: '2021-00456', date: 'March 25, 2026', time: '10:00 AM', duration: '30 minutes', topic: 'Grade inquiry for Midterm exam', status: 'pending', isToday: false, requestedAt: '3 hours ago' },
        { id: 3, studentName: 'Carlos Mendoza', studentId: '2021-00789', date: 'March 24, 2026', time: '3:30 PM', duration: '45 minutes', topic: 'Project proposal review', status: 'confirmed', isToday: true, requestedAt: '1 day ago' },
        { id: 4, studentName: 'Maria Garcia', studentId: '2021-00321', date: 'March 22, 2026', time: '1:00 PM', duration: '30 minutes', topic: 'Academic advising', status: 'declined', isToday: false, requestedAt: '3 days ago' }
    ];

    const consultationSlots = [
        { day: 'Monday', date: 'March 24', time: '2:00 PM - 4:00 PM', status: 'open', bookedCount: 1, maxCapacity: 3 },
        { day: 'Wednesday', date: 'March 26', time: '10:00 AM - 12:00 PM', status: 'open', bookedCount: 0, maxCapacity: 3 },
        { day: 'Friday', date: 'March 28', time: '1:00 PM - 3:00 PM', status: 'full', bookedCount: 3, maxCapacity: 3 }
    ];

    const presenceLogs = [
        { timestamp: '2026-03-17 09:15 AM', status: 'entered', location: 'CCS Building, Room 201', duration: null },
        { timestamp: '2026-03-17 11:30 AM', status: 'exited', location: 'CCS Building, Room 201', duration: '2h 15m' },
        { timestamp: '2026-03-17 01:00 PM', status: 'entered', location: 'CCS Building, Room 201', duration: null },
        { timestamp: '2026-03-16 09:00 AM', status: 'entered', location: 'CCS Building, Room 201', duration: null },
        { timestamp: '2026-03-16 12:00 PM', status: 'exited', location: 'CCS Building, Room 201', duration: '3h 0m' }
    ];

    const workloadStats = {
        thisWeek: { hoursLogged: 12.5, consultationsCompleted: 8, averageDuration: '45 min', pendingRequests: 2 },
        thisMonth: { hoursLogged: 48.0, consultationsCompleted: 32, averageDuration: '42 min', pendingRequests: 2 },
        trends: [
            { day: 'Mon', consultations: 3, hours: 2.5 },
            { day: 'Tue', consultations: 2, hours: 1.5 },
            { day: 'Wed', consultations: 4, hours: 3.0 },
            { day: 'Thu', consultations: 1, hours: 0.5 },
            { day: 'Fri', consultations: 3, hours: 2.0 }
        ]
    };

    const notifications = [
        { id: 1, type: 'new-request', message: 'New consultation request from Juan Dela Cruz', time: '1 hour ago', read: false },
        { id: 2, type: 'cancellation', message: 'Maria Garcia cancelled appointment for March 25', time: '2 hours ago', read: false },
        { id: 3, type: 'reminder', message: 'Upcoming consultation with Carlos Mendoza at 3:30 PM', time: '3 hours ago', read: true },
        { id: 4, type: 'alert', message: 'Presence not detected during scheduled hours yesterday', time: '1 day ago', read: true }
    ];

    return { instructor, appointments, consultationSlots, presenceLogs, workloadStats, notifications };
}

// Consultations
router.get('/consultations', (req, res) => {
    const data = getSharedData();
    res.render('pages/instructor/consultations', {
        title: 'FaciTrack - Consultations',
        ...data,
        pendingCount: data.appointments.filter(a => a.status === 'pending').length
    });
});

// Schedule
router.get('/schedule', (req, res) => {
    const data = getSharedData();
    res.render('pages/instructor/schedule', {
        title: 'FaciTrack - Schedule',
        ...data,
        pendingCount: data.appointments.filter(a => a.status === 'pending').length
    });
});

// Presence Logs
router.get('/presence', (req, res) => {
    const data = getSharedData();
    res.render('pages/instructor/presence', {
        title: 'FaciTrack - Presence Logs',
        ...data,
        pendingCount: data.appointments.filter(a => a.status === 'pending').length
    });
});

// Reports
router.get('/reports', (req, res) => {
    const data = getSharedData();
    res.render('pages/instructor/reports', {
        title: 'FaciTrack - Reports',
        ...data,
        pendingCount: data.appointments.filter(a => a.status === 'pending').length
    });
});

// Settings
router.get('/settings', (req, res) => {
    const data = getSharedData();
    res.render('pages/instructor/settings', {
        title: 'FaciTrack - Settings',
        ...data,
        pendingCount: data.appointments.filter(a => a.status === 'pending').length
    });
});

module.exports = router;
