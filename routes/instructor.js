const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Per-instructor timetable store (in-memory for prototype) ──
const timetableStore = {}; // key: instructorId → { subjects, blocks }

function getTimetable(instructorId) {
    return timetableStore[instructorId] || { subjects: [], blocks: {} };
}

// ── Schedule parser: extract blocks from OCR raw text ──
function parseScheduleText(rawText) {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    const dayAbbr = { MON:'Monday', TUE:'Tuesday', WED:'Wednesday', THU:'Thursday', FRI:'Friday',
                      MONDAY:'Monday', TUESDAY:'Tuesday', WEDNESDAY:'Wednesday', THURSDAY:'Thursday', FRIDAY:'Friday' };
    const timeSlots = [
        '07:00-08:00','08:00-09:00','09:00-10:00','10:00-11:00',
        '11:00-12:00','12:00-01:00','01:00-02:00','02:00-03:00',
        '03:00-04:00','04:00-05:00','05:00-06:00','06:00-07:00'
    ];

    const subjects = {};
    const blocks = {};
    const lines = rawText.split(/\n/).map(l => l.trim()).filter(Boolean);
    const colorMap = ['#e07b39','#7b6fc4','#e05c5c','#4a90d9','#4caf7d','#d4a017','#5b8dd9','#c45c8a'];
    let colorIdx = 0;

    // Try to find subject codes (e.g. ITEC 321, ISA 321)
    const subjectCodeRe = /\b([A-Z]{2,6}\s*\d{3,4}[A-Z]?)\b/g;
    // Try to find room names
    const roomRe = /\b(Room\s*\d+|MAC\s*Lab|ERP\s*Lab|Lab\s*\d*|[A-Z]+\s*Lab)\b/gi;
    // Try to find time patterns like 08:00-09:00 or 8:00-9:00
    const timeRe = /\b(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\b/g;

    // Detect column headers (days) and their approximate positions
    let detectedDays = [];
    lines.forEach(line => {
        const upper = line.toUpperCase();
        days.forEach(d => { if (upper.includes(d.toUpperCase()) && !detectedDays.includes(d)) detectedDays.push(d); });
    });
    if (!detectedDays.length) detectedDays = days;

    // Extract subject codes found in text
    const allCodes = [];
    rawText.replace(subjectCodeRe, (m, code) => { const c = code.replace(/\s+/,' ').trim(); if (!allCodes.includes(c)) allCodes.push(c); });

    // Build subject list
    allCodes.forEach(code => {
        if (!subjects[code]) {
            subjects[code] = { code, name: code, color: colorIdx % 8 };
            colorIdx++;
        }
    });

    // Try to extract rows: time | day blocks
    // Look for lines that start with a time pattern
    let currentTime = null;
    lines.forEach(line => {
        const timeMatch = line.match(/^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
        if (timeMatch) {
            // Normalize to slot format
            const h1 = timeMatch[1].padStart(5,'0'), h2 = timeMatch[2].padStart(5,'0');
            const slot = h1 + '-' + h2;
            if (timeSlots.includes(slot)) currentTime = slot;
        }

        if (currentTime) {
            // Look for subject codes and rooms in this line
            const codes = [];
            let m;
            const re = new RegExp(subjectCodeRe.source, 'g');
            while ((m = re.exec(line)) !== null) codes.push(m[1].replace(/\s+/,' ').trim());
            const rooms = line.match(roomRe) || [];

            // Try to associate with a day based on position in line
            // Simple heuristic: assign to first unoccupied day that appears in the line
            detectedDays.forEach((day, di) => {
                if (codes[di] || rooms[di]) {
                    const key = day + '_' + currentTime;
                    if (!blocks[key] && (codes[di] || codes[0])) {
                        blocks[key] = {
                            subjectCode: codes[di] || codes[0],
                            room: rooms[di] || rooms[0] || '—'
                        };
                    }
                }
            });
        }
    });

    return {
        subjects: Object.values(subjects),
        blocks
    };
}

router.use((req, res, next) => {
    console.log(`[Instructor Router] ${req.method} ${req.originalUrl}`);
    next();
});

// Lazy-load student router to avoid circular dependency
function getStudentRouter() {
    return require('./student');
}

// ── In-memory schedule store (persists for the server session) ──
// Key: instructor id (1 = Dr. Maria Santos for this prototype)
const scheduleStore = {
    1: [
        { day: 'Monday',    timeStart: '2:00 PM',  timeEnd: '3:00 PM',  maxCapacity: 3, bookedCount: 1, status: 'open' },
        { day: 'Wednesday', timeStart: '10:00 AM', timeEnd: '11:00 AM', maxCapacity: 3, bookedCount: 0, status: 'open' }
    ]
};

function getSchedule(instructorId) {
    return scheduleStore[instructorId] || [];
}

// Save schedule POST — called from the schedule page via fetch
router.post('/schedule/save', (req, res) => {
    const { slots } = req.body;
    if (!Array.isArray(slots)) return res.status(400).json({ error: 'Invalid data' });
    // Validate: max 2 slots, each must have day/timeStart/timeEnd/maxCapacity
    const cleaned = slots.slice(0, 2).map(s => ({
        day:         String(s.day || '').trim(),
        timeStart:   String(s.timeStart || '').trim(),
        timeEnd:     String(s.timeEnd || '').trim(),
        maxCapacity: Math.max(1, Math.min(10, parseInt(s.maxCapacity) || 3)),
        bookedCount: parseInt(s.bookedCount) || 0,
        status:      ['open','full','closed'].includes(s.status) ? s.status : 'open'
    })).filter(s => s.day && s.timeStart && s.timeEnd);
    scheduleStore[1] = cleaned;
    console.log('[Schedule] Saved:', JSON.stringify(cleaned));
    res.json({ success: true, slots: cleaned });
});

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
    
    // Input validation
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
        return res.render('pages/instructor/login', { 
            title: 'FaciTrack - Instructor Login',
            error: 'Please enter your email address.' 
        });
    }
    
    if (!password || typeof password !== 'string' || password.length === 0) {
        return res.render('pages/instructor/login', { 
            title: 'FaciTrack - Instructor Login',
            error: 'Please enter your password.' 
        });
    }
    
    // Simulated credentials for prototype
    const instructors = [
        { email: 'instructor@cspc.edu.ph', password: 'instructor123' },
        { email: 'maria.santos@cspc.edu.ph', password: 'instructor123' }
    ];
    
    // Check credentials
    const instructor = instructors.find(i => 
        i.email.toLowerCase() === email.trim().toLowerCase() && 
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
        email: 'maria.santos@cspc.edu.ph',
        position: 'Professor',
        department: 'College of Computer Studies',
        specialization: 'Software Engineering',
        officeRoom: 'CCS Building, Room 201',
        bleStatus: 'in-room',
        bleLastDetected: '2 minutes ago',
        statusOverride: false,
        profilePhoto: null
    };

    // Pull real bookings from student refStore for instructor ID 1
    const sr = getStudentRouter();
    let appointments = [];
    if (sr.refStore) {
        appointments = Object.values(sr.refStore)
            .filter(r => r.facultyId === 1)
            .map(r => ({
                id:          r.refNumber,
                studentName: r.studentName,
                studentId:   r.studentId,
                date:        r.date || r.day || '—',
                time:        r.slot || '—',
                duration:    '—',
                topic:       r.topic,
                status:      r.status,
                isToday:     false,
                requestedAt: r.requestedAt ? new Date(r.requestedAt).toLocaleString() : '—',
                declineReason: r.declineReason || ''
            }));
    }

    // Seed sample appointments if none exist yet (prototype fallback)
    if (!appointments.length) {
        function relDate(offset) {
            const d = new Date();
            d.setDate(d.getDate() + offset);
            return d.toISOString().split('T')[0];
        }
        appointments = [
            { id: 'SAMPLE-1', studentName: 'Juan Dela Cruz',  studentId: '2021-00123', date: relDate(0),  time: '2:00 PM',  duration: '30 min', topic: 'Thesis consultation',        status: 'pending',   isToday: true,  requestedAt: '—', declineReason: '' },
            { id: 'SAMPLE-2', studentName: 'Ana Reyes',        studentId: '2021-00456', date: relDate(0),  time: '3:30 PM',  duration: '45 min', topic: 'Project proposal review',    status: 'confirmed', isToday: true,  requestedAt: '—', declineReason: '' },
            { id: 'SAMPLE-3', studentName: 'Carlos Mendoza',   studentId: '2021-00789', date: relDate(-1), time: '10:00 AM', duration: '30 min', topic: 'Grade inquiry',              status: 'confirmed', isToday: false, requestedAt: '—', declineReason: '' },
            { id: 'SAMPLE-4', studentName: 'Maria Garcia',     studentId: '2021-00321', date: relDate(-2), time: '1:00 PM',  duration: '30 min', topic: 'Academic advising',          status: 'declined',  isToday: false, requestedAt: '—', declineReason: 'Schedule conflict' },
            { id: 'SAMPLE-5', studentName: 'Pedro Lim',        studentId: '2022-00111', date: relDate(1),  time: '9:00 AM',  duration: '30 min', topic: 'Research methodology',       status: 'pending',   isToday: false, requestedAt: '—', declineReason: '' },
            { id: 'SAMPLE-6', studentName: 'Rosa Fernandez',   studentId: '2022-00222', date: relDate(-3), time: '11:00 AM', duration: '45 min', topic: 'Capstone project feedback',  status: 'confirmed', isToday: false, requestedAt: '—', declineReason: '' },
            { id: 'SAMPLE-7', studentName: 'Luis Torres',      studentId: '2021-00555', date: relDate(-4), time: '2:00 PM',  duration: '30 min', topic: 'Grade reconsideration',      status: 'confirmed', isToday: false, requestedAt: '—', declineReason: '' },
            { id: 'SAMPLE-8', studentName: 'Kristine Uy',      studentId: '2022-00333', date: relDate(2),  time: '1:00 PM',  duration: '30 min', topic: 'AI project consultation',    status: 'pending',   isToday: false, requestedAt: '—', declineReason: '' }
        ];
    }


    // Pull live schedule from store — format for the schedule page
    const consultationSlots = getSchedule(1).map(s => ({
        day:         s.day,
        date:        '',
        time:        `${s.timeStart} - ${s.timeEnd}`,
        timeStart:   s.timeStart,
        timeEnd:     s.timeEnd,
        status:      s.status,
        bookedCount: s.bookedCount,
        maxCapacity: s.maxCapacity
    }));

    const presenceLogs = [
        { timestamp: '2026-03-17 09:15 AM', status: 'entered', location: 'CCS Building, Room 201', duration: null },
        { timestamp: '2026-03-17 11:30 AM', status: 'exited',  location: 'CCS Building, Room 201', duration: '2h 15m' },
        { timestamp: '2026-03-17 01:00 PM', status: 'entered', location: 'CCS Building, Room 201', duration: null },
        { timestamp: '2026-03-16 09:00 AM', status: 'entered', location: 'CCS Building, Room 201', duration: null },
        { timestamp: '2026-03-16 12:00 PM', status: 'exited',  location: 'CCS Building, Room 201', duration: '3h 0m' }
    ];

    const workloadStats = {
        thisWeek:  {
            hoursLogged: appointments.filter(a => a.status === 'confirmed').length * 0.75,
            consultationsCompleted: appointments.filter(a => a.status === 'confirmed').length,
            averageDuration: '45 min',
            pendingRequests: appointments.filter(a => a.status === 'pending').length
        },
        thisMonth: {
            hoursLogged: appointments.filter(a => a.status === 'confirmed').length * 1.5,
            consultationsCompleted: appointments.filter(a => a.status === 'confirmed').length,
            averageDuration: '42 min',
            pendingRequests: appointments.filter(a => a.status === 'pending').length
        },
        trends: (function() {
            const days = ['Mon','Tue','Wed','Thu','Fri'];
            const today = new Date().getDay(); // 0=Sun,1=Mon,...
            // Count real appointments per weekday from this week
            const counts = [0,0,0,0,0];
            appointments.forEach(function(a) {
                const d = new Date(a.date);
                const dow = d.getDay();
                if (dow >= 1 && dow <= 5) counts[dow - 1]++;
            });
            // If all zero (no real data), use sample values
            const hasData = counts.some(c => c > 0);
            const sample = [3, 2, 4, 1, 3];
            return days.map((day, i) => ({
                day,
                consultations: hasData ? counts[i] : sample[i],
                hours: hasData ? counts[i] * 0.75 : sample[i] * 0.75
            }));
        })()
    };

    const notifications = [
        { id: 1, type: 'new-request',  message: 'New consultation request from Juan Dela Cruz',           time: '1 hour ago',  read: false },
        { id: 2, type: 'cancellation', message: 'Maria Garcia cancelled appointment for March 25',         time: '2 hours ago', read: false },
        { id: 3, type: 'reminder',     message: 'Upcoming consultation with Carlos Mendoza at 3:30 PM',   time: '3 hours ago', read: true  },
        { id: 4, type: 'alert',        message: 'Presence not detected during scheduled hours yesterday',  time: '1 day ago',   read: true  }
    ];

    return { instructor, appointments, consultationSlots, presenceLogs, workloadStats, notifications };
}

// Consultations
// Supports query parameters: ?status=pending|confirmed|declined&page=N
router.get('/consultations', (req, res) => {
    const data = getSharedData();
    const { status } = req.query;

    let filteredAppointments = data.appointments;
    if (status) {
        filteredAppointments = filteredAppointments.filter(a => a.status === status);
    }

    res.render('pages/instructor/consultations', {
        title: 'FaciTrack - Consultations',
        ...data,
        appointments: filteredAppointments,
        filterStatus: status || '',
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

// Workload — Load timetable
router.get('/workload/load', (req, res) => {
    const data = getTimetable(1); // instructor ID 1 for prototype
    res.json(data);
});

// Workload — Save timetable
router.post('/workload/save', (req, res) => {
    const { subjects, blocks } = req.body;
    if (!Array.isArray(subjects) || typeof blocks !== 'object') {
        return res.status(400).json({ error: 'Invalid data' });
    }
    // Validate subjects
    for (const s of subjects) {
        if (!s.code || !s.code.trim() || !s.name || !s.name.trim()) {
            return res.status(400).json({ error: 'Subject code and name are required.' });
        }
    }
    timetableStore[1] = { subjects, blocks };
    console.log('[Workload] Saved for instructor 1:', subjects.length, 'subjects,', Object.keys(blocks).length, 'blocks');
    res.json({ success: true });
});

// Workload — OCR Import
router.post('/workload/ocr-import', upload.single('schedule'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image uploaded.' });
    const mime = req.file.mimetype;
    if (!['image/jpeg','image/png','image/webp'].includes(mime)) {
        return res.status(400).json({ success: false, error: 'Invalid file type. Use JPEG, PNG, or WEBP.' });
    }
    try {
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(req.file.buffer);
        await worker.terminate();
        console.log('[OCR] Raw text length:', text.length);
        const parsed = parseScheduleText(text);
        if (!Object.keys(parsed.blocks).length && !parsed.subjects.length) {
            return res.json({ success: false, error: 'Could not detect a schedule in this image. Try a clearer, well-lit photo.' });
        }
        res.json({ success: true, data: parsed, rawText: text });
    } catch (err) {
        console.error('[OCR] Error:', err);
        res.status(500).json({ success: false, error: 'OCR processing failed. Please try again.' });
    }
});

// Workload page
router.get('/workload', (req, res) => {
    const data = getSharedData();
    res.render('pages/instructor/workload', {
        title: 'FaciTrack - Workload',
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

// Consultations — Approve
router.post('/consultations/:id/approve', (req, res) => {
    const refNumber = req.params.id;
    const sr = getStudentRouter();
    const booking = sr.refStore && sr.refStore[refNumber];
    if (booking) {
        booking.status = 'confirmed';
        sr.confirmSlot(booking.facultyId, booking.day, booking.slot);
        console.log(`[Instructor] Approved booking ${refNumber}`);
    } else {
        console.log(`[Instructor] Approved appointment ID: ${refNumber}`);
    }
    res.json({ success: true, message: 'Appointment approved.' });
});

// Consultations — Decline
router.post('/consultations/:id/decline', (req, res) => {
    const refNumber = req.params.id;
    const { reason } = req.body;
    const sr = getStudentRouter();
    const booking = sr.refStore && sr.refStore[refNumber];
    if (booking) {
        booking.status = 'declined';
        booking.declineReason = reason || '';
        // Release the slot so other students can book it
        sr.releaseSlot(booking.facultyId, booking.day, booking.slot);
        console.log(`[Instructor] Declined booking ${refNumber}, reason: ${reason}`);
    } else {
        console.log(`[Instructor] Declined appointment ID: ${refNumber}, reason: ${reason}`);
    }
    res.json({ success: true, message: 'Appointment declined.' });
});

module.exports = router;
module.exports.getScheduleStore = () => scheduleStore;
