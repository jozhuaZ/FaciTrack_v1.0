const express = require('express');
const router = express.Router();

// Landing page
router.get('/', (req, res) => {
    res.render('pages/index', { title: 'FaciTrack - Faculty Appointment & Monitoring System' });
});

// Unified staff login page (instructor, dean, admin)
router.get('/login', (req, res) => {
    res.render('pages/login', {
        title: 'FaciTrack - Staff Login',
        error: null
    });
});

// Unified staff login POST — detect role from credentials and redirect
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('pages/login', {
            title: 'FaciTrack - Staff Login',
            error: !email ? 'Please enter your email address.' : 'Please enter your password.'
        });
    }

    const emailLower = email.trim().toLowerCase();

    // Block student emails (@my.cspc.edu.ph that aren't staff)
    if (emailLower.endsWith('@my.cspc.edu.ph')) {
        return res.render('pages/login', {
            title: 'FaciTrack - Staff Login',
            error: 'Students do not need to log in. Use the Faculty Directory on the home page.'
        });
    }

    // Simulated credential store — mirrors each role's route
    const instructors = [
        { email: 'instructor@cspc.edu.ph', password: 'instructor123' },
        { email: 'maria.santos@cspc.edu.ph', password: 'instructor123' }
    ];
    const deans = [
        { email: 'dean@cspc.edu.ph', password: 'dean123' }
    ];
    const admins = [
        { email: 'admin@cspc.edu.ph', password: 'admin123' }
    ];

    if (admins.find(u => u.email === emailLower && u.password === password)) {
        return res.redirect('/admin/dashboard');
    }
    if (deans.find(u => u.email === emailLower && u.password === password)) {
        return res.redirect('/dean/dashboard');
    }
    if (instructors.find(u => u.email === emailLower && u.password === password)) {
        return res.redirect('/instructor/dashboard');
    }

    return res.render('pages/login', {
        title: 'FaciTrack - Staff Login',
        error: 'Invalid email or password. Please try again.'
    });
});

// Backward compatibility — redirect old /roles to home
router.get('/roles', (req, res) => {
    res.redirect('/');
});

module.exports = router;
