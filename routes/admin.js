const express = require('express');
const router = express.Router();

// Administrator Login page
router.get('/login', (req, res) => {
    res.render('pages/admin/login', { 
        title: 'FaciTrack - Administrator Login',
        error: null 
    });
});

// Administrator Login POST handler
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Simulated credentials for prototype
    const admins = [
        { email: 'admin@my.cspc.edu.ph', password: 'admin123' }
    ];
    
    // Check credentials
    const admin = admins.find(a => 
        a.email.toLowerCase() === email.toLowerCase() && 
        a.password === password
    );
    
    if (admin) {
        res.redirect('/admin/dashboard');
    } else {
        res.render('pages/admin/login', { 
            title: 'FaciTrack - Administrator Login',
            error: 'Invalid email or password.' 
        });
    }
});

// Administrator Dashboard (coming soon)
router.get('/dashboard', (req, res) => {
    res.redirect('/');
});

module.exports = router;
