const express = require('express');
const router = express.Router();
const instructorRouter = require('./instructor');

router.use((req, res, next) => {
    console.log(`[Student Router] ${req.method} ${req.originalUrl}`);
    next();
});

// ── Faculty list — all slots exactly 1 hour ──
const facultyList = [
    {
        id: 1, name: 'Dr. Maria Santos', department: 'College of Computer Studies',
        position: 'Professor', specialization: 'Software Engineering', status: 'available',
        nextAvailable: 'Today, 2:00 PM', email: 'msantos@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 201', consultationSlots: []
    },
    {
        id: 2, name: 'Prof. Jose Dela Cruz', department: 'College of Computer Studies',
        position: 'Associate Professor', specialization: 'Database Systems', status: 'busy',
        nextAvailable: 'Tomorrow, 10:00 AM', email: 'jdelacruz@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 105',
        consultationSlots: [
            { day: 'Tuesday',  time: '9:00 AM – 10:00 AM', status: 'open', maxCapacity: 3 },
            { day: 'Thursday', time: '1:00 PM – 2:00 PM',  status: 'open', maxCapacity: 3 }
        ]
    },
    {
        id: 3, name: 'Dr. Ana Villanueva', department: 'College of Computer Studies',
        position: 'Assistant Professor', specialization: 'Information Systems', status: 'available',
        nextAvailable: 'Today, 9:00 AM', email: 'avillanueva@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 203',
        consultationSlots: [
            { day: 'Monday',    time: '9:00 AM – 10:00 AM', status: 'open', maxCapacity: 3 },
            { day: 'Wednesday', time: '1:00 PM – 2:00 PM',  status: 'open', maxCapacity: 3 }
        ]
    },
    {
        id: 4, name: 'Prof. Carlos Bautista', department: 'College of Computer Studies',
        position: 'Instructor', specialization: 'Computer Networks', status: 'away',
        nextAvailable: 'Tomorrow, 9:00 AM', email: 'cbautista@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 102',
        consultationSlots: [
            { day: 'Tuesday',  time: '2:00 PM – 3:00 PM',  status: 'open', maxCapacity: 3 },
            { day: 'Thursday', time: '9:00 AM – 10:00 AM', status: 'open', maxCapacity: 3 }
        ]
    },
    {
        id: 5, name: 'Dr. Ramon Aquino', department: 'College of Computer Studies',
        position: 'Associate Professor', specialization: 'Artificial Intelligence', status: 'available',
        nextAvailable: 'Today, 3:00 PM', email: 'raquino@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 204',
        consultationSlots: [
            { day: 'Monday',   time: '1:00 PM – 2:00 PM',   status: 'open', maxCapacity: 3 },
            { day: 'Thursday', time: '10:00 AM – 11:00 AM', status: 'open', maxCapacity: 3 }
        ]
    },
    {
        id: 6, name: 'Prof. Liza Navarro', department: 'College of Computer Studies',
        position: 'Instructor', specialization: 'Web Development', status: 'busy',
        nextAvailable: 'Today, 4:00 PM', email: 'lnavarro@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 106',
        consultationSlots: [
            { day: 'Wednesday', time: '2:00 PM – 3:00 PM',   status: 'full', maxCapacity: 3 },
            { day: 'Friday',    time: '10:00 AM – 11:00 AM', status: 'open', maxCapacity: 3 }
        ]
    },
    {
        id: 7, name: 'Dr. Eduardo Flores', department: 'College of Computer Studies',
        position: 'Professor', specialization: 'Cybersecurity', status: 'available',
        nextAvailable: 'Today, 1:00 PM', email: 'eflores@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 202',
        consultationSlots: [
            { day: 'Tuesday',  time: '1:00 PM – 2:00 PM', status: 'open', maxCapacity: 3 },
            { day: 'Thursday', time: '2:00 PM – 3:00 PM', status: 'open', maxCapacity: 3 }
        ]
    },
    {
        id: 8, name: 'Prof. Grace Mendoza', department: 'College of Computer Studies',
        position: 'Assistant Professor', specialization: 'Mobile Application Development', status: 'away',
        nextAvailable: 'Tomorrow, 10:00 AM', email: 'gmendoza@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 107',
        consultationSlots: [
            { day: 'Monday', time: '10:00 AM – 11:00 AM', status: 'open', maxCapacity: 3 },
            { day: 'Friday', time: '2:00 PM – 3:00 PM',   status: 'open', maxCapacity: 3 }
        ]
    },
    {
        id: 9, name: 'Dr. Benjamin Reyes', department: 'College of Computer Studies',
        position: 'Associate Professor', specialization: 'Data Science', status: 'available',
        nextAvailable: 'Today, 11:00 AM', email: 'breyes@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 205',
        consultationSlots: [
            { day: 'Tuesday',   time: '10:00 AM – 11:00 AM', status: 'open', maxCapacity: 3 },
            { day: 'Wednesday', time: '3:00 PM – 4:00 PM',   status: 'open', maxCapacity: 3 }
        ]
    },
    {
        id: 10, name: 'Prof. Maricel Castro', department: 'College of Computer Studies',
        position: 'Instructor', specialization: 'Systems Analysis and Design', status: 'busy',
        nextAvailable: 'Tomorrow, 1:00 PM', email: 'mcastro@cspc.edu.ph',
        officeRoom: 'CCS Building, Room 103',
        consultationSlots: [
            { day: 'Monday',   time: '3:00 PM – 4:00 PM', status: 'open', maxCapacity: 3 },
            { day: 'Thursday', time: '1:00 PM – 2:00 PM', status: 'full', maxCapacity: 3 }
        ]
    }
];

const departments = [
    { value: 'College of Computer Studies',        label: 'College of Computer Studies (CCS)' },
    { value: 'College of Teacher Education',       label: 'College of Teacher Education (CTE)' },
    { value: 'College of Engineering',             label: 'College of Engineering (COE)' },
    { value: 'College of Agriculture',             label: 'College of Agriculture (CA)' },
    { value: 'College of Business Administration', label: 'College of Business Administration (CBA)' },
    { value: 'College of Arts and Sciences',       label: 'College of Arts and Sciences (CAS)' },
];

// ── Reference number store ──
const refStore = {};

// ── Slot booking tracker ──
// key: `${facultyId}_${day}_${slotTime}` → { refNumber, studentEmail, status }
const slotBookings = {};

function slotKey(facultyId, day, slotTime) {
    return `${facultyId}_${day}_${slotTime.trim()}`;
}

// Check if a slot is taken (pending or confirmed)
function isSlotTaken(facultyId, day, slotTime) {
    const entry = slotBookings[slotKey(facultyId, day, slotTime)];
    return entry && (entry.status === 'pending' || entry.status === 'confirmed');
}

// Lock a slot
function lockSlot(facultyId, day, slotTime, refNumber, studentEmail) {
    slotBookings[slotKey(facultyId, day, slotTime)] = { refNumber, studentEmail, status: 'pending' };
}

// Release a slot (on decline or cancellation)
function releaseSlot(facultyId, day, slotTime) {
    delete slotBookings[slotKey(facultyId, day, slotTime)];
}

// Confirm a slot
function confirmSlot(facultyId, day, slotTime) {
    const entry = slotBookings[slotKey(facultyId, day, slotTime)];
    if (entry) entry.status = 'confirmed';
}

// Get all taken slots for a faculty (for the profile page)
// key format: `${facultyId}_${day}_${slotTime}` e.g. "1_Monday_2:00 PM – 2:20 PM"
function getTakenSlots(facultyId) {
    const taken = {};
    const prefix = `${facultyId}_`;
    Object.entries(slotBookings).forEach(([key, val]) => {
        if (!key.startsWith(prefix)) return;
        if (val.status !== 'pending' && val.status !== 'confirmed') return;
        const rest = key.slice(prefix.length); // "Monday_2:00 PM – 2:20 PM"
        const underscoreIdx = rest.indexOf('_');
        if (underscoreIdx === -1) return;
        const day = rest.slice(0, underscoreIdx);
        const slotTime = rest.slice(underscoreIdx + 1);
        if (!taken[day]) taken[day] = [];
        taken[day].push(slotTime);
    });
    return taken;
}

function generateRefNumber() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return 'FT-' + code;
}

// Expose slot functions for instructor route to call on approve/decline

// Get faculty — ID 1 pulls live schedule from instructor store
function getFaculty(id) {
    const f = facultyList.find(f => f.id === id);
    if (!f) return null;
    if (id === 1) {
        const store = instructorRouter.getScheduleStore();
        const liveSlots = (store[1] || []).map(s => ({
            day: s.day, time: `${s.timeStart} – ${s.timeEnd}`,
            timeStart: s.timeStart, timeEnd: s.timeEnd,
            status: s.status, maxCapacity: s.maxCapacity
        }));
        return { ...f, consultationSlots: liveSlots };
    }
    return f;
}

// ── Routes ──

router.get('/dashboard', (req, res) => {
    const { status, search, dept } = req.query;
    let filtered = facultyList.map(f => getFaculty(f.id));
    if (dept)   filtered = filtered.filter(f => f.department === dept);
    if (status) filtered = filtered.filter(f => f.status === status);
    if (search) {
        const kw = search.toLowerCase();
        filtered = filtered.filter(f =>
            f.name.toLowerCase().includes(kw) || f.specialization.toLowerCase().includes(kw)
        );
    }
    res.render('pages/student/dashboard', {
        title: 'FaciTrack - Faculty Directory',
        facultyList: filtered, filterStatus: status || '',
        searchQuery: search || '', activeDept: dept || '', departments
    });
});

router.get('/faculty/:id', (req, res) => {
    const faculty = getFaculty(parseInt(req.params.id));
    if (!faculty) return res.redirect('/student/dashboard');
    const takenSlots = getTakenSlots(faculty.id);
    res.render('pages/student/profile', {
        title: `FaciTrack - ${faculty.name}`,
        faculty,
        takenSlots
    });
});

router.get('/faculty/:id/book', (req, res) => {
    const faculty = getFaculty(parseInt(req.params.id));
    if (!faculty) return res.redirect('/student/dashboard');
    const hasOpen = faculty.consultationSlots.some(s => s.status === 'open');
    if (!hasOpen || faculty.status === 'away') return res.redirect(`/student/faculty/${faculty.id}`);
    res.render('pages/student/book', {
        title: `FaciTrack - Book Appointment with ${faculty.name}`,
        faculty, selectedSlot: req.query.slot || null, selectedDate: req.query.date || null
    });
});

router.post('/faculty/:id/book', (req, res) => {
    const faculty = getFaculty(parseInt(req.params.id));
    if (!faculty) return res.redirect('/student/dashboard');

    const { studentName, studentId, studentEmail, selectedSlot, consultTopic, consultNotes, selectedDate } = req.body;

    const renderError = (msg) => res.render('pages/student/book', {
        title: `FaciTrack - Book Appointment with ${faculty.name}`, faculty, error: msg
    });

    if (!studentName || !studentName.trim()) return renderError('Please enter your full name.');
    if (!studentId   || !studentId.trim())   return renderError('Please enter your student ID.');
    if (!studentEmail || !studentEmail.trim()) return renderError('Please enter your email address.');
    if (!selectedSlot) return renderError('Please select a consultation slot.');
    if (!consultTopic || !consultTopic.trim()) return renderError('Please describe your consultation topic.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail.trim())) return renderError('Please enter a valid email address.');
    if (!studentEmail.toLowerCase().endsWith('@my.cspc.edu.ph'))
        return renderError('Please use your official CSPC student email (@my.cspc.edu.ph).');

    const sanitizedName  = studentName.trim().substring(0, 100);
    const sanitizedId    = studentId.trim().substring(0, 20);
    const sanitizedTopic = consultTopic.trim().substring(0, 500);
    const sanitizedNotes = (consultNotes || '').trim().substring(0, 1000);
    const normalizedEmail = studentEmail.toLowerCase().trim();

    // ── Slot conflict checks ──
    const dayFromSlot = selectedDate ? selectedDate.split(',')[0].trim() : '';

    // Check if this exact slot is already taken (pending or confirmed)
    if (isSlotTaken(faculty.id, dayFromSlot, selectedSlot)) {
        return renderError('This slot has already been booked by another student. Please go back and select a different slot.');
    }

    // Check if this student already has a pending/confirmed booking with this instructor
    const existingBooking = Object.values(refStore).find(r =>
        r.facultyId === faculty.id &&
        r.studentEmail === normalizedEmail &&
        (r.status === 'pending' || r.status === 'confirmed')
    );
    if (existingBooking) {
        return renderError(`You already have an active booking with ${faculty.name} (Ref: ${existingBooking.refNumber}). Please wait for the instructor to respond before booking again.`);
    }

    // Generate reference number and lock the slot
    const refNumber = generateRefNumber();
    lockSlot(faculty.id, dayFromSlot, selectedSlot, refNumber, normalizedEmail);

    refStore[refNumber] = {
        refNumber, facultyId: faculty.id, facultyName: faculty.name,
        studentName: sanitizedName, studentId: sanitizedId, studentEmail: normalizedEmail,
        slot: selectedSlot, day: dayFromSlot, date: selectedDate || '', topic: sanitizedTopic,
        notes: sanitizedNotes, status: 'pending', requestedAt: new Date().toISOString()
    };

    console.log(`[Booking] Ref: ${refNumber} | ${sanitizedName} booked with ${faculty.name}`);

    // Build back href so student can return to booking form with data pre-filled
    const backHref = `/student/faculty/${faculty.id}/book?` + new URLSearchParams({
        prefill_name:  sanitizedName,
        prefill_id:    sanitizedId,
        prefill_email: normalizedEmail,
        prefill_topic: sanitizedTopic,
        prefill_notes: sanitizedNotes,
        slot:          selectedSlot,
        date:          selectedDate || ''
    }).toString();

    // Render the booking confirmation page (reference number — NOT OTP)
    res.render('pages/student/booking-confirm', {
        title: 'FaciTrack - Booking Confirmed',
        email: normalizedEmail,
        refNumber,
        backHref,
        bookingData: {
            facultyName: faculty.name,
            topic:       sanitizedTopic,
            slot:        selectedSlot,
            date:        selectedDate || ''
        }
    });
});

router.get('/appointments', (req, res) => {
    res.render('pages/student/appointments', { title: 'FaciTrack - My Appointments' });
});

router.get('/availability', (req, res) => {
    res.render('pages/student/availability', {
        title: 'FaciTrack - Faculty Availability', facultyList
    });
});

// Validate reference number (used by appointments page gate)
router.get('/ref/validate', (req, res) => {
    const ref = (req.query.ref || '').toUpperCase().trim();
    if (refStore[ref]) {
        return res.json({ valid: true, appointment: refStore[ref] });
    }
    // For demo: accept any FT-XXXXXX format
    if (/^FT-[A-Z0-9]{6}$/.test(ref)) {
        return res.json({ valid: true, appointment: null });
    }
    res.json({ valid: false });
});

module.exports = router;
module.exports.releaseSlot  = releaseSlot;
module.exports.confirmSlot  = confirmSlot;
module.exports.slotBookings = slotBookings;
module.exports.refStore     = refStore;
