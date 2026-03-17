const express = require('express');
const router = express.Router();



// Shared simulated faculty data
const facultyList = [
    {
        id: 1,
        name: 'Dr. Maria Santos',
        department: 'College of Computer Studies',
        position: 'Professor',
        specialization: 'Software Engineering',
        status: 'available',
        nextAvailable: 'Today, 2:00 PM',
        email: 'msantos@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 201',
        consultationSlots: [
            { day: 'Monday', time: '1:00 PM – 3:00 PM', status: 'open' },
            { day: 'Wednesday', time: '10:00 AM – 12:00 PM', status: 'open' },
            { day: 'Friday', time: '2:00 PM – 4:00 PM', status: 'full' }
        ]
    },
    {
        id: 2,
        name: 'Prof. Juan Dela Cruz',
        department: 'College of Computer Studies',
        position: 'Associate Professor',
        specialization: 'Database Systems',
        status: 'busy',
        nextAvailable: 'Tomorrow, 10:00 AM',
        email: 'jdelacruz@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 105',
        consultationSlots: [
            { day: 'Tuesday', time: '9:00 AM – 11:00 AM', status: 'open' },
            { day: 'Thursday', time: '1:00 PM – 3:00 PM', status: 'open' }
        ]
    },
    {
        id: 3,
        name: 'Dr. Ana Reyes',
        department: 'College of Engineering and Architecture',
        position: 'Assistant Professor',
        specialization: 'Electronics Engineering',
        status: 'available',
        nextAvailable: 'Today, 3:30 PM',
        email: 'areyes@cspc.edu.ph',
        officeRoom: 'CEA Building, Room 103',
        consultationSlots: [
            { day: 'Monday', time: '3:00 PM – 5:00 PM', status: 'open' },
            { day: 'Wednesday', time: '1:00 PM – 3:00 PM', status: 'full' },
            { day: 'Friday', time: '9:00 AM – 11:00 AM', status: 'open' }
        ]
    },
    {
        id: 4,
        name: 'Prof. Carlos Mendoza',
        department: 'College of Engineering and Architecture',
        position: 'Instructor',
        specialization: 'Civil Engineering',
        status: 'away',
        nextAvailable: 'Monday, 9:00 AM',
        email: 'cmendoza@cspc.edu.ph',
        officeRoom: 'CEA Building, Room 102',
        consultationSlots: [
            { day: 'Monday', time: '9:00 AM – 11:00 AM', status: 'open' },
            { day: 'Thursday', time: '2:00 PM – 4:00 PM', status: 'open' }
        ]
    },
    {
        id: 5,
        name: 'Dr. Sofia Garcia',
        department: 'College of Arts and Sciences',
        position: 'Professor',
        specialization: 'Applied Mathematics',
        status: 'available',
        nextAvailable: 'Today, 1:00 PM',
        email: 'sgarcia@cspc.edu.ph',
        officeRoom: 'CAS Building, Room 205',
        consultationSlots: [
            { day: 'Tuesday', time: '1:00 PM – 3:00 PM', status: 'open' },
            { day: 'Thursday', time: '10:00 AM – 12:00 PM', status: 'full' },
            { day: 'Friday', time: '1:00 PM – 3:00 PM', status: 'open' }
        ]
    },
    {
        id: 6,
        name: 'Prof. Miguel Torres',
        department: 'College of Tourism, Hospitality and Business Management',
        position: 'Associate Professor',
        specialization: 'Entrepreneurship',
        status: 'busy',
        nextAvailable: 'Today, 4:00 PM',
        email: 'mtorres@cspc.edu.ph',
        officeRoom: 'CTHBM Building, Room 108',
        consultationSlots: [
            { day: 'Monday', time: '2:00 PM – 4:00 PM', status: 'full' },
            { day: 'Wednesday', time: '9:00 AM – 11:00 AM', status: 'open' }
        ]
    }
];

// Student Verification page
router.get('/verify', (req, res) => {
    res.render('pages/student/verify', { 
        title: 'FaciTrack - Student Verification',
        error: null 
    });
});

// Student Verification POST (simulated)
router.post('/verify', (req, res) => {
    const { email } = req.body;
    if (email === 'student@my.cspc.edu.ph') {
        res.redirect('/student/dashboard');
    } else {
        return res.render('pages/student/verify', { 
            title: 'FaciTrack - Student Verification',
            error: 'The CSPC email is not valid.' 
        });
    }
});

// Student Dashboard page
router.get('/dashboard', (req, res) => {
    res.render('pages/student/dashboard', { 
        title: 'FaciTrack - Faculty Dashboard',
        facultyList 
    });
});

// Student Faculty Profile page
router.get('/dashboard/:id', (req, res) => {
    const faculty = facultyList.find(f => f.id === parseInt(req.params.id));
    if (!faculty) return res.redirect('/student/dashboard');

    res.render('pages/student/profile', {
        title: `FaciTrack - ${faculty.name}`,
        faculty
    });
});

module.exports = router;
