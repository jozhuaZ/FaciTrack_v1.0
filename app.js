// Import required modules
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware: Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware: Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Middleware: Parse JSON bodies
app.use(express.json());

// Middleware: Global logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes - IMPORTANT: This must be active
app.use('/', require('./routes/index'));
app.use('/student', require('./routes/student'));
app.use('/instructor', require('./routes/instructor'));
app.use('/display', require('./routes/display'));
app.use('/dean', require('./routes/dean'));
app.use('/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:');
    console.error('URL:', req.url);
    console.error('Method:', req.method);
    console.error('Error message:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 FaciTrack server running on http://localhost:${PORT}`);
});
