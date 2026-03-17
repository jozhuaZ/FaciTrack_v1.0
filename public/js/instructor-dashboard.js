// =============================================
// INSTRUCTOR DASHBOARD — Sidebar Layout
// Professional Design for FaciTrack
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Quick Actions
    const btnExportSchedule = document.getElementById('btnExportSchedule');
    if (btnExportSchedule) {
        btnExportSchedule.addEventListener('click', function() {
            showToast('success', 'Export Schedule', 'Your consultation schedule has been exported to calendar format.');
        });
    }

    const btnDownloadReport = document.getElementById('btnDownloadReport');
    if (btnDownloadReport) {
        btnDownloadReport.addEventListener('click', function() {
            showToast('success', 'Download Report', 'Downloading CSPC-formatted workload report...');
        });
    }

    // Mark All Notifications as Read
    const btnMarkAllRead = document.getElementById('btnMarkAllRead');
    if (btnMarkAllRead) {
        btnMarkAllRead.addEventListener('click', function() {
            document.querySelectorAll('.notification-row.unread').forEach(item => {
                item.classList.remove('unread');
                const indicator = item.querySelector('.notif-unread-dot');
                if (indicator) indicator.remove();
            });
            showToast('success', 'Notifications', 'All notifications marked as read.');
        });
    }
    
    // Modal Management
    const declineModal = document.getElementById('declineModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelDeclineBtn = document.getElementById('cancelDecline');
    const confirmDeclineBtn = document.getElementById('confirmDecline');
    const declineReasonInput = document.getElementById('declineReason');
    const declineStudentNameEl = document.getElementById('declineStudentName');

    let currentDeclineId = null;
    let currentDeclineStudent = null;

    function showModal(studentName, aptId) {
        currentDeclineId = aptId;
        currentDeclineStudent = studentName;
        declineStudentNameEl.textContent = studentName;
        declineReasonInput.value = '';
        declineModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        declineModal.classList.remove('show');
        document.body.style.overflow = '';
        currentDeclineId = null;
        currentDeclineStudent = null;
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (cancelDeclineBtn) cancelDeclineBtn.addEventListener('click', hideModal);

    // Close modal on backdrop click
    if (declineModal) {
        declineModal.addEventListener('click', (e) => {
            if (e.target === declineModal) {
                hideModal();
            }
        });
    }

    // ESC key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && declineModal.classList.contains('show')) {
            hideModal();
        }
    });

    // Confirm Decline
    if (confirmDeclineBtn) {
        confirmDeclineBtn.addEventListener('click', () => {
            const reason = declineReasonInput.value.trim();
            
            if (!reason) {
                showToast('error', 'Reason Required', 'Please provide a reason for declining this appointment.');
                return;
            }

            // In production, this would be an API call
            hideModal();
            showToast('success', 'Appointment Declined', `${currentDeclineStudent} has been notified via email with your reason.`);
            
            // Remove the appointment row from the list
            setTimeout(() => {
                const rows = document.querySelectorAll('.appointment-row');
                rows.forEach(row => {
                    const studentName = row.querySelector('.apt-row-name');
                    if (studentName && studentName.textContent === currentDeclineStudent) {
                        row.style.opacity = '0';
                        row.style.transform = 'translateX(-20px)';
                        setTimeout(() => row.remove(), 300);
                    }
                });
            }, 500);
        });
    }

    // Toast Notification System
    function showToast(type, title, message) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <p class="toast-title">${title}</p>
                <p class="toast-message">${message}</p>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // Appointment Actions - Approve
    document.querySelectorAll('.btn-icon-action.approve').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const aptId = this.dataset.id;
            const studentName = this.dataset.student;
            
            // In production, this would be an API call
            showToast('success', 'Appointment Approved', `${studentName}'s appointment has been confirmed. Confirmation email sent.`);
            
            // Remove the appointment row from the list
            setTimeout(() => {
                const row = this.closest('.appointment-row');
                if (row) {
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-20px)';
                    setTimeout(() => row.remove(), 300);
                }
            }, 500);
        });
    });

    // Appointment Actions - Decline
    document.querySelectorAll('.btn-icon-action.decline').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const aptId = this.dataset.id;
            const studentName = this.dataset.student;
            showModal(studentName, aptId);
        });
    });

});

