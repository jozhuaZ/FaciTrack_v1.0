const express = require('express');
const router = express.Router();

// Dean Login page
router.get('/login', (req, res) => {
    res.render('pages/dean/login', { 
        title: 'FaciTrack - Dean Login',
        error: null 
    });
});

// Dean Login POST handler
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const deans = [
        { email: 'dean@my.cspc.edu.ph', password: 'dean123' }
    ];
    const dean = deans.find(d => 
        d.email.toLowerCase() === email.toLowerCase() && 
        d.password === password
    );
    if (dean) {
        res.redirect('/dean/dashboard');
    } else {
        res.render('pages/dean/login', { 
            title: 'FaciTrack - Dean Login',
            error: 'Invalid email or password.' 
        });
    }
});

// Shared simulated data
function getSharedData() {
    const dean = {
        name: 'Dr. Lourdes Reyes',
        email: 'dean@my.cspc.edu.ph',
        position: 'Dean',
        department: 'College of Computer Studies'
    };

    const faculty = [
        {
            id: 1,
            name: 'Dr. Maria Santos',
            position: 'Professor',
            department: 'College of Computer Studies',
            officeRoom: 'CCS Building, Room 201',
            bleStatus: 'in-room',
            bleLastDetected: '2 minutes ago',
            hoursThisMonth: 48,
            consultationsThisMonth: 32,
            avgDuration: '42 min'
        },
        {
            id: 2,
            name: 'Prof. Jose Dela Cruz',
            position: 'Associate Professor',
            department: 'College of Computer Studies',
            officeRoom: 'CCS Building, Room 105',
            bleStatus: 'out-of-room',
            bleLastDetected: '1 hour ago',
            hoursThisMonth: 36,
            consultationsThisMonth: 24,
            avgDuration: '38 min'
        },
        {
            id: 3,
            name: 'Dr. Ana Villanueva',
            position: 'Assistant Professor',
            department: 'College of Computer Studies',
            officeRoom: 'CCS Building, Room 203',
            bleStatus: 'in-room',
            bleLastDetected: '5 minutes ago',
            hoursThisMonth: 42,
            consultationsThisMonth: 28,
            avgDuration: '45 min'
        },
        {
            id: 4,
            name: 'Prof. Carlos Bautista',
            position: 'Instructor',
            department: 'College of Computer Studies',
            officeRoom: 'CCS Building, Room 102',
            bleStatus: 'out-of-room',
            bleLastDetected: '3 hours ago',
            hoursThisMonth: 30,
            consultationsThisMonth: 18,
            avgDuration: '35 min'
        },
        {
            id: 5,
            name: 'Dr. Ramon Aquino',
            position: 'Associate Professor',
            department: 'College of Computer Studies',
            officeRoom: 'CCS Building, Room 204',
            bleStatus: 'in-room',
            bleLastDetected: '10 minutes ago',
            hoursThisMonth: 40,
            consultationsThisMonth: 22,
            avgDuration: '40 min'
        },
        {
            id: 6,
            name: 'Prof. Liza Navarro',
            position: 'Instructor',
            department: 'College of Computer Studies',
            officeRoom: 'CCS Building, Room 106',
            bleStatus: 'in-room',
            bleLastDetected: '8 minutes ago',
            hoursThisMonth: 28,
            consultationsThisMonth: 15,
            avgDuration: '33 min'
        },
        {
            id: 7,
            name: 'Dr. Eduardo Flores',
            position: 'Professor',
            department: 'College of Computer Studies',
            officeRoom: 'CCS Building, Room 202',
            bleStatus: 'in-room',
            bleLastDetected: '3 minutes ago',
            hoursThisMonth: 44,
            consultationsThisMonth: 30,
            avgDuration: '44 min'
        },
        {
            id: 8,
            name: 'Prof. Grace Mendoza',
            position: 'Assistant Professor',
            department: 'College of Computer Studies',
            officeRoom: 'CCS Building, Room 107',
            bleStatus: 'out-of-room',
            bleLastDetected: '2 hours ago',
            hoursThisMonth: 32,
            consultationsThisMonth: 20,
            avgDuration: '36 min'
        },
        {
            id: 9,
            name: 'Dr. Benjamin Reyes',
            position: 'Associate Professor',
            department: 'College of Computer Studies',
            officeRoom: 'CCS Building, Room 205',
            bleStatus: 'in-room',
            bleLastDetected: '15 minutes ago',
            hoursThisMonth: 38,
            consultationsThisMonth: 25,
            avgDuration: '39 min'
        },
        {
            id: 10,
            name: 'Prof. Maricel Castro',
            position: 'Instructor',
            department: 'College of Computer Studies',
            officeRoom: 'CCS Building, Room 103',
            bleStatus: 'out-of-room',
            bleLastDetected: '4 hours ago',
            hoursThisMonth: 26,
            consultationsThisMonth: 14,
            avgDuration: '32 min'
        }
    ];

    const allAppointments = [
        { id: 1, studentName: 'Juan Dela Cruz', studentId: '2021-00123', instructorName: 'Dr. Maria Santos', date: 'March 24, 2026', time: '2:00 PM', duration: '30 minutes', topic: 'Thesis consultation regarding system architecture', status: 'pending', isToday: true },
        { id: 2, studentName: 'Ana Reyes', studentId: '2021-00456', instructorName: 'Dr. Maria Santos', date: 'March 25, 2026', time: '10:00 AM', duration: '30 minutes', topic: 'Grade inquiry for Midterm exam', status: 'pending', isToday: false },
        { id: 3, studentName: 'Carlos Mendoza', studentId: '2021-00789', instructorName: 'Dr. Maria Santos', date: 'March 24, 2026', time: '3:30 PM', duration: '45 minutes', topic: 'Project proposal review', status: 'confirmed', isToday: true },
        { id: 4, studentName: 'Maria Garcia', studentId: '2021-00321', instructorName: 'Prof. Jose Dela Cruz', date: 'March 22, 2026', time: '1:00 PM', duration: '30 minutes', topic: 'Academic advising', status: 'declined', isToday: false },
        { id: 5, studentName: 'Pedro Lim', studentId: '2022-00111', instructorName: 'Dr. Ana Villanueva', date: 'March 24, 2026', time: '9:00 AM', duration: '30 minutes', topic: 'Research methodology guidance', status: 'confirmed', isToday: true },
        { id: 6, studentName: 'Rosa Fernandez', studentId: '2022-00222', instructorName: 'Prof. Carlos Bautista', date: 'March 25, 2026', time: '11:00 AM', duration: '45 minutes', topic: 'Capstone project feedback', status: 'pending', isToday: false },
        { id: 7, studentName: 'Luis Torres', studentId: '2021-00555', instructorName: 'Dr. Ana Villanueva', date: 'March 23, 2026', time: '2:00 PM', duration: '30 minutes', topic: 'Grade reconsideration request', status: 'confirmed', isToday: false },
        { id: 8, studentName: 'Kristine Uy', studentId: '2022-00333', instructorName: 'Dr. Ramon Aquino', date: 'March 24, 2026', time: '1:00 PM', duration: '30 minutes', topic: 'AI project consultation', status: 'confirmed', isToday: true },
        { id: 9, studentName: 'Mark Villanueva', studentId: '2022-00444', instructorName: 'Prof. Liza Navarro', date: 'March 25, 2026', time: '2:00 PM', duration: '45 minutes', topic: 'Web app debugging session', status: 'pending', isToday: false },
        { id: 10, studentName: 'Sheila Ramos', studentId: '2021-00666', instructorName: 'Dr. Eduardo Flores', date: 'March 24, 2026', time: '3:00 PM', duration: '30 minutes', topic: 'Network security thesis review', status: 'confirmed', isToday: true },
        { id: 11, studentName: 'Jerome Pascual', studentId: '2022-00555', instructorName: 'Prof. Grace Mendoza', date: 'March 26, 2026', time: '10:00 AM', duration: '30 minutes', topic: 'Mobile app UI feedback', status: 'pending', isToday: false },
        { id: 12, studentName: 'Diane Soriano', studentId: '2021-00777', instructorName: 'Dr. Benjamin Reyes', date: 'March 24, 2026', time: '11:00 AM', duration: '45 minutes', topic: 'Data science capstone guidance', status: 'confirmed', isToday: true },
        { id: 13, studentName: 'Ryan Ocampo', studentId: '2022-00666', instructorName: 'Prof. Maricel Castro', date: 'March 25, 2026', time: '1:00 PM', duration: '30 minutes', topic: 'System design review', status: 'pending', isToday: false }
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

    const recentActivity = presenceLogs.slice(0, 6);

    return { dean, faculty, allAppointments, presenceLogs, recentActivity };
}

// Dean Dashboard
router.get('/dashboard', (req, res) => {
    const data = getSharedData();
    res.render('pages/dean/dashboard', {
        title: 'FaciTrack - Dean Dashboard',
        ...data
    });
});

// Faculty list with real-time BLE status
router.get('/faculty', (req, res) => {
    const data = getSharedData();
    res.render('pages/dean/faculty', {
        title: 'FaciTrack - Faculty',
        ...data
    });
});

// Presence monitoring logs
router.get('/monitoring', (req, res) => {
    const data = getSharedData();
    res.render('pages/dean/monitoring', {
        title: 'FaciTrack - Monitoring',
        ...data
    });
});

// All appointments across all faculty
router.get('/appointments', (req, res) => {
    const data = getSharedData();
    res.render('pages/dean/appointments', {
        title: 'FaciTrack - Appointments',
        ...data
    });
});

// Workload reports per faculty
router.get('/reports', (req, res) => {
    const data = getSharedData();
    res.render('pages/dean/reports', {
        title: 'FaciTrack - Reports',
        ...data
    });
});

module.exports = router;
