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
    
    // Simulated credentials for prototype
    const deans = [
        { email: 'dean@my.cspc.edu.ph', password: 'dean123' }
    ];
    
    // Check credentials
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

// Dean Dashboard (coming soon)
router.get('/dashboard', (req, res) => {
    res.redirect('/');
});

module.exports = router;
