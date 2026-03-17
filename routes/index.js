const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
    const data = {
        title: 'FaciTrack - Home',
        systemName: 'FaciTrack',
        fullName: 'Faculty Appointment and Real-Time Monitoring System',
        institution: 'Camarines Sur Polytechnic Colleges',
        department: 'College of Computer Studies'
    };
    
    res.render('pages/index', data);
});

// Roles page route
router.get('/roles', (req, res) => {
    res.render('pages/roles', { title: 'FaciTrack - Select Role' });
});

module.exports = router;
