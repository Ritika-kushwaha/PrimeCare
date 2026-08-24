(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/patient/book/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BookAppointmentPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Navbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ProtectedRoute$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ProtectedRoute.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$stethoscope$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stethoscope$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/stethoscope.mjs [app-client] (ecmascript) <export default as Stethoscope>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.mjs [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/printer.mjs [app-client] (ecmascript) <export default as Printer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-plus.mjs [app-client] (ecmascript) <export default as CalendarPlus>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const DEFAULT_DOCTORS = [
    {
        id: 'doc-cardio-01',
        email: 'ritikakushwaha62@gmail.com',
        name: 'Dr. Ritika Kushwaha',
        specialisation: 'Cardiology',
        qualification: 'MD, DM (Cardiology - AIIMS Delhi)',
        experience: '14 Years Practice',
        hospital: 'PrimeCare Apex Heart Institute',
        fee: '₹1,200',
        rating: '4.9 ★',
        bio: 'Senior Interventional Cardiologist specializing in preventive heart disease, diagnostic angiographies, coronary interventions, and comprehensive lipid management.'
    },
    {
        id: 'doc-cardio-02',
        email: 'aarav.sharma@primecare.in',
        name: 'Dr. Aarav Sharma',
        specialisation: 'Cardiology',
        qualification: 'MD, DM (Cardiology - AIIMS)',
        experience: '12 Years Practice',
        hospital: 'PrimeCare Metro Hospital',
        fee: '₹1,200',
        rating: '4.9 ★',
        bio: 'Senior Interventional Cardiologist specializing in preventive heart disease.'
    },
    {
        id: 'doc-cardio-03',
        email: 'meera.kulkarni@primecare.in',
        name: 'Dr. Meera Kulkarni',
        specialisation: 'Cardiology',
        qualification: 'MD, DNB (Cardiology)',
        experience: '10 Years Practice',
        hospital: 'PrimeCare Metro Hospital',
        fee: '₹1,400',
        rating: '4.8 ★',
        bio: 'Specialist in non-invasive coronary imaging, pediatric cardiology, and heart rhythm management.'
    },
    {
        id: 'doc-neuro-01',
        email: 'priya.nair@primecare.in',
        name: 'Dr. Priya Nair',
        specialisation: 'Neurology',
        qualification: 'MD, DM (Neurology - NIMHANS)',
        experience: '12 Years Practice',
        hospital: 'PrimeCare Neuroscience Center',
        fee: '₹1,500',
        rating: '4.9 ★',
        bio: 'Consultant Neurologist focused on headache disorders, neuropathies, epilepsy, and acute stroke treatment.'
    },
    {
        id: 'doc-ortho-01',
        email: 'vikram.patel@primecare.in',
        name: 'Dr. Vikram Patel',
        specialisation: 'Orthopedics',
        qualification: 'MS (Orthopedics), MCh',
        experience: '15 Years Practice',
        hospital: 'PrimeCare Ortho Wing',
        fee: '₹1,000',
        rating: '4.7 ★',
        bio: 'Joint replacement, arthroscopic ligament surgery, and complex sports injury rehabilitation specialist.'
    },
    {
        id: 'doc-pedia-01',
        email: 'ananya.deshmukh@primecare.in',
        name: 'Dr. Ananya Deshmukh',
        specialisation: 'Pediatrics',
        qualification: 'MD (Pediatrics), DCH',
        experience: '9 Years Practice',
        hospital: 'PrimeCare Children Pavilion',
        fee: '₹900',
        rating: '5.0 ★',
        bio: 'Pediatrician handling newborn intensive care, routine growth assessments, and childhood immunizations.'
    },
    {
        id: 'doc-derma-01',
        email: 'rohan.mehta@primecare.in',
        name: 'Dr. Rohan Mehta',
        specialisation: 'Dermatology',
        qualification: 'MD (Dermatology)',
        experience: '8 Years Practice',
        hospital: 'PrimeCare Skin Clinic',
        fee: '₹1,100',
        rating: '4.8 ★',
        bio: 'Specialist in laser therapeutics, clinical dermatology, acne scarring, and trichology.'
    }
];
const TIME_SLOTS = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM'
];
function BookAppointmentPage() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [doctors, setDoctors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_DOCTORS);
    const [appointments, setAppointments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [leaves, setLeaves] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedDept, setSelectedDept] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('ALL');
    const [selectedDoctor, setSelectedDoctor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_DOCTORS[0]);
    const todayStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BookAppointmentPage.useMemo[todayStr]": ()=>new Date().toISOString().split('T')[0]
    }["BookAppointmentPage.useMemo[todayStr]"], []);
    const [selectedDate, setSelectedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(todayStr);
    const [selectedSlot, setSelectedSlot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('10:00 AM');
    const [patientFirstName, setPatientFirstName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "BookAppointmentPage.useState": ()=>user?.firstName || 'Ritika'
    }["BookAppointmentPage.useState"]);
    const [patientLastName, setPatientLastName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "BookAppointmentPage.useState": ()=>user?.lastName || 'Kushwaha'
    }["BookAppointmentPage.useState"]);
    const [patientAge, setPatientAge] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('21');
    const [patientGender, setPatientGender] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Female');
    const [patientEmail, setPatientEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "BookAppointmentPage.useState": ()=>user?.email || 'ritikakushwaha62@gmail.com'
    }["BookAppointmentPage.useState"]);
    const [chiefComplaint, setChiefComplaint] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Routine consultation');
    const [bookingLoading, setBookingLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [bookedAppointment, setBookedAppointment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [emailSending, setEmailSending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [calendarUrl, setCalendarUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookAppointmentPage.useEffect": ()=>{
            const fetchData = {
                "BookAppointmentPage.useEffect.fetchData": async ()=>{
                    try {
                        const docRes = await fetch('/api/sync/doctors', {
                            cache: 'no-store'
                        });
                        const docData = await docRes.json();
                        if (docData.success && Array.isArray(docData.doctors) && docData.doctors.length > 0) {
                            setDoctors(docData.doctors);
                            setSelectedDoctor(docData.doctors[0]);
                        }
                    } catch  {}
                    try {
                        const apptRes = await fetch('/api/sync/appointments', {
                            cache: 'no-store'
                        });
                        const apptData = await apptRes.json();
                        if (apptData.success && Array.isArray(apptData.appointments)) {
                            setAppointments(apptData.appointments);
                        }
                    } catch  {}
                    try {
                        const leavesRes = await fetch('/api/sync/leaves?includePast=true', {
                            cache: 'no-store'
                        });
                        const leavesData = await leavesRes.json();
                        if (leavesData.success && Array.isArray(leavesData.leaves)) {
                            setLeaves(leavesData.leaves);
                        }
                    } catch  {}
                }
            }["BookAppointmentPage.useEffect.fetchData"];
            fetchData();
        }
    }["BookAppointmentPage.useEffect"], []);
    const departments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BookAppointmentPage.useMemo[departments]": ()=>{
            const set = new Set();
            doctors.forEach({
                "BookAppointmentPage.useMemo[departments]": (d)=>{
                    if (d.specialisation) set.add(d.specialisation);
                }
            }["BookAppointmentPage.useMemo[departments]"]);
            return [
                'ALL',
                ...Array.from(set)
            ];
        }
    }["BookAppointmentPage.useMemo[departments]"], [
        doctors
    ]);
    const filteredDoctors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BookAppointmentPage.useMemo[filteredDoctors]": ()=>{
            if (selectedDept === 'ALL') return doctors;
            return doctors.filter({
                "BookAppointmentPage.useMemo[filteredDoctors]": (d)=>d.specialisation.toLowerCase() === selectedDept.toLowerCase()
            }["BookAppointmentPage.useMemo[filteredDoctors]"]);
        }
    }["BookAppointmentPage.useMemo[filteredDoctors]"], [
        doctors,
        selectedDept
    ]);
    const cleanDocName = (name)=>(name || '').toLowerCase().replace(/^dr\.\s*/i, '').trim();
    const normalizeDate = (d)=>{
        if (!d) return '';
        return String(d).split('T')[0].trim().toLowerCase();
    };
    const isDoctorOnLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BookAppointmentPage.useMemo[isDoctorOnLeave]": ()=>{
            if (!selectedDoctor || !selectedDate) return null;
            const docClean = cleanDocName(selectedDoctor.name);
            const docId = (selectedDoctor.id || '').toLowerCase().trim();
            const docEmail = (selectedDoctor.email || '').toLowerCase().trim();
            const selDateClean = normalizeDate(selectedDate);
            return leaves.find({
                "BookAppointmentPage.useMemo[isDoctorOnLeave]": (l)=>{
                    const leaveDateClean = normalizeDate(l.leaveDate);
                    if (leaveDateClean !== selDateClean) return false;
                    const lDocClean = cleanDocName(l.doctorName);
                    const lDocId = (l.doctorId || '').toLowerCase().trim();
                    const idMatch = Boolean(lDocId && docId && lDocId === docId);
                    const emailMatch = Boolean(docEmail && (l.doctorName || '').toLowerCase().includes(docEmail));
                    const nameMatch = Boolean(lDocClean && docClean && (lDocClean.includes(docClean) || docClean.includes(lDocClean)));
                    return idMatch || emailMatch || nameMatch;
                }
            }["BookAppointmentPage.useMemo[isDoctorOnLeave]"]);
        }
    }["BookAppointmentPage.useMemo[isDoctorOnLeave]"], [
        selectedDoctor,
        selectedDate,
        leaves
    ]);
    const getSlotAvailability = (slot)=>{
        if (isDoctorOnLeave) {
            return {
                available: false,
                isLeave: true,
                reason: `Dr. on Leave (${isDoctorOnLeave.reason || 'Duty Leave'})`
            };
        }
        if (!selectedDoctor || !selectedDate) return {
            available: true,
            isLeave: false,
            reason: 'Available'
        };
        const docClean = cleanDocName(selectedDoctor.name);
        const docId = (selectedDoctor.id || '').toLowerCase().trim();
        const docEmail = (selectedDoctor.email || '').toLowerCase().trim();
        const selDateClean = normalizeDate(selectedDate);
        const slotClean = (slot || '').trim().toLowerCase();
        const isBooked = appointments.some((a)=>{
            if (normalizeDate(a.date) !== selDateClean || (a.timeSlot || '').trim().toLowerCase() !== slotClean) return false;
            if (a.status === 'CANCELLED' || a.status === 'LEAVE_CANCELLED') return false;
            const aDocClean = cleanDocName(a.doctorName);
            const aDocEmail = (a.doctorEmail || '').toLowerCase().trim();
            const aDocId = (a.doctorId || '').toLowerCase().trim();
            return aDocId && aDocId === docId || aDocEmail && aDocEmail === docEmail || aDocClean && docClean && (aDocClean.includes(docClean) || docClean.includes(aDocClean));
        });
        if (isBooked) {
            return {
                available: false,
                isLeave: false,
                reason: 'Slot Booked'
            };
        }
        return {
            available: true,
            isLeave: false,
            reason: 'Available'
        };
    };
    const triggerInstantEmail = async (apt)=>{
        if (!apt) return;
        setEmailSending(true);
        const targetEmail = (apt.patientEmail || patientEmail || user?.email || 'ritikakushwaha62@gmail.com').trim().toLowerCase();
        try {
            const res = await fetch('/api/notifications/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'APPOINTMENT_CONFIRMATION',
                    recipientEmail: targetEmail,
                    patientEmail: targetEmail,
                    doctorEmail: apt.doctorEmail,
                    patientName: apt.patientName,
                    doctorName: apt.doctorName,
                    specialisation: apt.department,
                    date: apt.date,
                    timeSlot: apt.timeSlot,
                    tokenNumber: apt.tokenNumber,
                    fee: apt.fee
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Confirmation & Reminder email successfully sent to ${targetEmail}!`);
            } else {
                alert(`Email Notice: ${data.error || 'Check SMTP configuration'}`);
            }
        } catch  {
            alert('Network error connecting to email API.');
        } finally{
            setEmailSending(false);
        }
    };
    const handleBooking = async (e)=>{
        e.preventDefault();
        if (!selectedDoctor) {
            alert('Please select a doctor.');
            return;
        }
        if (isDoctorOnLeave) {
            alert(`Dr. ${selectedDoctor.name} is on authorized duty leave on ${selectedDate} (${isDoctorOnLeave.reason || 'Scheduled Leave'}). Please select another date or specialist.`);
            return;
        }
        const slotCheck = getSlotAvailability(selectedSlot);
        if (!slotCheck.available) {
            alert(`The selected time slot (${selectedSlot}) is not available (${slotCheck.reason}). Please select another slot.`);
            return;
        }
        setBookingLoading(true);
        const cleanEmail = (patientEmail || user?.email || 'ritikakushwaha62@gmail.com').trim().toLowerCase();
        const cleanName = `${patientFirstName} ${patientLastName}`.trim() || 'Patient Member';
        const newToken = `TK-${Math.floor(100 + Math.random() * 900)}`;
        const newAppointment = {
            id: `apt-${Date.now()}`,
            tokenNumber: newToken,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            doctorEmail: selectedDoctor.email,
            department: selectedDoctor.specialisation,
            fee: selectedDoctor.fee,
            date: selectedDate,
            timeSlot: selectedSlot,
            symptoms: chiefComplaint || 'General Outpatient Consultation',
            patientName: cleanName,
            patientEmail: cleanEmail,
            age: patientAge || 21,
            gender: patientGender || 'Female',
            status: 'CONFIRMED'
        };
        try {
            const updated = [
                newAppointment,
                ...appointments
            ];
            setAppointments(updated);
            await fetch('/api/sync/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    appointments: updated
                })
            });
            // Dispatch automated booking confirmation email to BOTH patient AND doctor
            try {
                await fetch('/api/notifications/email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'APPOINTMENT_CONFIRMATION',
                        recipientEmail: cleanEmail,
                        patientEmail: cleanEmail,
                        doctorEmail: selectedDoctor.email,
                        patientName: cleanName,
                        doctorName: selectedDoctor.name,
                        specialisation: selectedDoctor.specialisation,
                        date: selectedDate,
                        timeSlot: selectedSlot,
                        tokenNumber: newToken,
                        fee: selectedDoctor.fee
                    })
                });
            } catch (mailErr) {
                console.warn('Auto mail error:', mailErr);
            }
            // Dispatch iCalendar email invite to patient email
            try {
                await fetch('/api/appointments/book', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tokenNumber: newToken,
                        doctorName: selectedDoctor.name,
                        department: selectedDoctor.specialisation,
                        hospital: selectedDoctor.hospital || 'PrimeCare Multispecialty Hospital',
                        date: selectedDate,
                        timeSlot: selectedSlot,
                        patientName: cleanName,
                        patientEmail: cleanEmail,
                        fee: selectedDoctor.fee
                    })
                });
            } catch (icsMailErr) {
                console.warn('ICS mail error:', icsMailErr);
            }
            // Generate Google Calendar deep-link for patient
            try {
                const calRes = await fetch('/api/calendar/add-event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        patientName: cleanName,
                        doctorName: selectedDoctor.name,
                        specialisation: selectedDoctor.specialisation,
                        date: selectedDate,
                        timeSlot: selectedSlot,
                        tokenNumber: newToken,
                        fee: selectedDoctor.fee,
                        hospital: selectedDoctor.hospital || 'PrimeCare Multispecialty Hospital'
                    })
                });
                const calData = await calRes.json();
                if (calData.success && calData.calendarUrl) {
                    setCalendarUrl(calData.calendarUrl);
                }
            } catch (calErr) {
                console.warn('Calendar deep-link generation error:', calErr);
            }
            setBookedAppointment(newAppointment);
        } catch (err) {
            alert(`Booking failed: ${err.message}`);
        } finally{
            setBookingLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ProtectedRoute$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        allowedRoles: [
            'PATIENT',
            'DOCTOR',
            'ADMIN'
        ],
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/src/app/patient/book/page.tsx",
                    lineNumber: 365,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8",
                    children: [
                        bookedAppointment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 rounded-3xl bg-emerald-950/50 border border-emerald-500/50 shadow-2xl space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/30 pb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 text-emerald-400 font-extrabold text-xl",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                            className: "w-6 h-6 text-emerald-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                            lineNumber: 374,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "Slot Confirmed • Token ",
                                                                bookedAppointment.tokenNumber
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                            lineNumber: 375,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 373,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-slate-300 mt-1",
                                                    children: [
                                                        "Confirmed for ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            className: "text-white",
                                                            children: bookedAppointment.patientName
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                            lineNumber: 378,
                                                            columnNumber: 35
                                                        }, this),
                                                        " with ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            className: "text-emerald-300",
                                                            children: bookedAppointment.doctorName
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                            lineNumber: 378,
                                                            columnNumber: 112
                                                        }, this),
                                                        " on ",
                                                        bookedAppointment.date,
                                                        " at ",
                                                        bookedAppointment.timeSlot,
                                                        "."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 377,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                            lineNumber: 372,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>triggerInstantEmail(bookedAppointment),
                                                    disabled: emailSending,
                                                    className: "px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                            lineNumber: 389,
                                                            columnNumber: 21
                                                        }, this),
                                                        " ",
                                                        emailSending ? 'Sending Email...' : 'Send Confirmation / Reminder Email'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 383,
                                                    columnNumber: 19
                                                }, this),
                                                calendarUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: calendarUrl,
                                                    target: "_blank",
                                                    rel: "noopener noreferrer",
                                                    className: "px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-blue-500/20",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarPlus$3e$__["CalendarPlus"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                            lineNumber: 398,
                                                            columnNumber: 23
                                                        }, this),
                                                        " Add to Google Calendar"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 392,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>window.print(),
                                                    className: "px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__["Printer"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                            lineNumber: 406,
                                                            columnNumber: 21
                                                        }, this),
                                                        " Print Slip"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 401,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                            lineNumber: 382,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                    lineNumber: 371,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-slate-400 block text-[10px] uppercase font-bold",
                                                    children: "Consulting Physician"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 413,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    className: "text-white text-sm block mt-0.5",
                                                    children: bookedAppointment.doctorName
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 414,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-emerald-400",
                                                    children: bookedAppointment.department
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 415,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                            lineNumber: 412,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-slate-400 block text-[10px] uppercase font-bold",
                                                    children: "Date & Time Slot"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 418,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    className: "text-white text-sm block mt-0.5",
                                                    children: bookedAppointment.date
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 419,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-amber-300",
                                                    children: bookedAppointment.timeSlot
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 420,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                            lineNumber: 417,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-slate-400 block text-[10px] uppercase font-bold",
                                                    children: "Patient Details"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 423,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    className: "text-white text-sm block mt-0.5",
                                                    children: bookedAppointment.patientName
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 424,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-slate-400",
                                                    children: bookedAppointment.patientEmail
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 425,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                            lineNumber: 422,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3.5 bg-slate-950/70 rounded-2xl border border-emerald-500/20",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-slate-400 block text-[10px] uppercase font-bold",
                                                    children: "Consultation Fee"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 428,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    className: "text-emerald-300 text-sm block mt-0.5",
                                                    children: bookedAppointment.fee
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 429,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-slate-400",
                                                    children: "PrimeCare Hospital"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 430,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                            lineNumber: 427,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                    lineNumber: 411,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/patient/book/page.tsx",
                            lineNumber: 370,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 lg:grid-cols-12 gap-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "lg:col-span-5 space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-base font-bold text-white flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$stethoscope$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stethoscope$3e$__["Stethoscope"], {
                                                        className: "w-4 h-4 text-emerald-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                        lineNumber: 441,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Select Specialist (",
                                                    filteredDoctors.length,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                lineNumber: 440,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                            lineNumber: 439,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2 overflow-x-auto pb-2",
                                            children: departments.map((dept)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setSelectedDept(dept),
                                                    className: `px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedDept === dept ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`,
                                                    children: dept
                                                }, dept, false, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 447,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                            lineNumber: 445,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3 max-h-[580px] overflow-y-auto pr-1",
                                            children: filteredDoctors.map((doc)=>{
                                                const isSelected = selectedDoctor?.id === doc.id;
                                                const docOnLeave = leaves.some((l)=>{
                                                    if (normalizeDate(l.leaveDate) !== normalizeDate(selectedDate)) return false;
                                                    const lDocClean = cleanDocName(l.doctorName);
                                                    const docClean = cleanDocName(doc.name);
                                                    const lDocId = (l.doctorId || '').toLowerCase().trim();
                                                    const docId = (doc.id || '').toLowerCase().trim();
                                                    const docEmail = (doc.email || '').toLowerCase().trim();
                                                    return lDocId && lDocId === docId || docEmail && (l.doctorName || '').toLowerCase().includes(docEmail) || lDocClean && docClean && (lDocClean.includes(docClean) || docClean.includes(lDocClean));
                                                });
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    onClick: ()=>setSelectedDoctor(doc),
                                                    className: `p-5 rounded-3xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${isSelected ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl' : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-start justify-between",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-center gap-2",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                                            className: "font-bold text-base text-white",
                                                                                            children: doc.name
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                                                            lineNumber: 490,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        docOnLeave && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400",
                                                                                            children: [
                                                                                                "On Leave (",
                                                                                                selectedDate,
                                                                                                ")"
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                                                            lineNumber: 492,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                                                    lineNumber: 489,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-xs font-semibold text-emerald-400",
                                                                                    children: doc.specialisation
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                                                    lineNumber: 497,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                                            lineNumber: 488,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs font-mono font-bold text-emerald-300 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20",
                                                                            children: doc.fee
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                                            lineNumber: 499,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                                    lineNumber: 487,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-slate-400 mt-1",
                                                                    children: [
                                                                        doc.hospital,
                                                                        " • ",
                                                                        doc.qualification
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                                    lineNumber: 503,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                            lineNumber: 486,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-slate-300 italic line-clamp-2",
                                                            children: [
                                                                '"',
                                                                doc.bio,
                                                                '"'
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                            lineNumber: 505,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, doc.id, true, {
                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                    lineNumber: 477,
                                                    columnNumber: 21
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                            lineNumber: 462,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                    lineNumber: 438,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "lg:col-span-7",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        onSubmit: handleBooking,
                                        className: "p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "border-b border-slate-800 pb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] uppercase font-bold text-emerald-400 tracking-wider",
                                                        children: "Appointment Details"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                        lineNumber: 516,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-2xl font-extrabold text-white mt-0.5",
                                                        children: selectedDoctor?.name || 'Select a Physician'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                        lineNumber: 517,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-400",
                                                        children: [
                                                            selectedDoctor?.specialisation,
                                                            " • ",
                                                            selectedDoctor?.hospital
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                        lineNumber: 518,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                lineNumber: 515,
                                                columnNumber: 17
                                            }, this),
                                            isDoctorOnLeave && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                initial: {
                                                    opacity: 0,
                                                    scale: 0.98
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    scale: 1
                                                },
                                                className: "p-4 bg-red-950/50 border border-red-500/50 text-red-200 text-xs rounded-2xl flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                        className: "w-5 h-5 text-red-400 flex-shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                        lineNumber: 527,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                className: "block font-bold text-sm text-red-300",
                                                                children: "Doctor Unavailable (On Duty Leave)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 529,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    selectedDoctor?.name,
                                                                    " is on authorized leave on ",
                                                                    selectedDate,
                                                                    " (",
                                                                    isDoctorOnLeave.reason || 'Scheduled Leave',
                                                                    "). All time slots are unavailable."
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 530,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                        lineNumber: 528,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                lineNumber: 522,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-4 text-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-slate-400 font-semibold mb-1",
                                                                        children: "First Name"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                                        lineNumber: 538,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "text",
                                                                        required: true,
                                                                        value: patientFirstName,
                                                                        onChange: (e)=>setPatientFirstName(e.target.value),
                                                                        className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                                        lineNumber: 539,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 537,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-slate-400 font-semibold mb-1",
                                                                        children: "Last Name"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                                        lineNumber: 548,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "text",
                                                                        required: true,
                                                                        value: patientLastName,
                                                                        onChange: (e)=>setPatientLastName(e.target.value),
                                                                        className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                                        lineNumber: 549,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 547,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                        lineNumber: 536,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-slate-400 font-semibold mb-1",
                                                                        children: "Age"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                                        lineNumber: 561,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "number",
                                                                        required: true,
                                                                        value: patientAge,
                                                                        onChange: (e)=>setPatientAge(e.target.value),
                                                                        className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                                        lineNumber: 562,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 560,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-slate-400 font-semibold mb-1",
                                                                        children: "Gender"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                                        lineNumber: 571,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        value: patientGender,
                                                                        onChange: (e)=>setPatientGender(e.target.value),
                                                                        className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "Female",
                                                                                children: "Female"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                                lineNumber: 577,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "Male",
                                                                                children: "Male"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                                lineNumber: 578,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: "Other",
                                                                                children: "Other"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                                lineNumber: 579,
                                                                                columnNumber: 25
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                                        lineNumber: 572,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 570,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "block text-slate-400 font-semibold mb-1",
                                                                        children: "Email Address (For Confirmation)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                                        lineNumber: 583,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "email",
                                                                        required: true,
                                                                        value: patientEmail,
                                                                        onChange: (e)=>setPatientEmail(e.target.value),
                                                                        className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                                        lineNumber: 584,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 582,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                        lineNumber: 559,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-slate-400 font-semibold mb-1",
                                                                children: "Select Consultation Date"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 595,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "date",
                                                                required: true,
                                                                value: selectedDate,
                                                                onChange: (e)=>setSelectedDate(e.target.value),
                                                                className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 596,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                        lineNumber: 594,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-slate-400 font-semibold mb-2",
                                                                children: "Available Consultation Time Slots"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 606,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-3 sm:grid-cols-4 gap-2",
                                                                children: TIME_SLOTS.map((slot)=>{
                                                                    const isSelected = selectedSlot === slot;
                                                                    const { available, isLeave, reason } = getSlotAvailability(slot);
                                                                    if (!available) {
                                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            disabled: true,
                                                                            className: `py-2 px-2 rounded-xl font-bold border text-center transition cursor-not-allowed opacity-60 ${isLeave ? 'bg-red-950/30 text-red-400 border-red-500/40' : 'bg-slate-900/80 text-slate-500 border-slate-800 line-through'}`,
                                                                            title: reason,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "text-[11px]",
                                                                                    children: slot
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                                                    lineNumber: 625,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "text-[9px] font-semibold uppercase mt-0.5",
                                                                                    children: isLeave ? 'On Leave' : 'Booked'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                                                                    lineNumber: 626,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, slot, true, {
                                                                            fileName: "[project]/src/app/patient/book/page.tsx",
                                                                            lineNumber: 614,
                                                                            columnNumber: 29
                                                                        }, this);
                                                                    }
                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>setSelectedSlot(slot),
                                                                        className: `py-2 px-3 rounded-xl font-bold border transition text-center ${isSelected ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20' : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'}`,
                                                                        children: slot
                                                                    }, slot, false, {
                                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                                        lineNumber: 632,
                                                                        columnNumber: 27
                                                                    }, this);
                                                                })
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 607,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                        lineNumber: 605,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-slate-400 font-semibold mb-1",
                                                                children: "Chief Medical Complaint / Symptoms"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 650,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                rows: 2,
                                                                required: true,
                                                                value: chiefComplaint,
                                                                onChange: (e)=>setChiefComplaint(e.target.value),
                                                                className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                                lineNumber: 651,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                                        lineNumber: 649,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                lineNumber: 535,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                disabled: bookingLoading || Boolean(isDoctorOnLeave) || !getSlotAvailability(selectedSlot).available,
                                                className: "w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-sm transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed",
                                                children: bookingLoading ? 'Confirming Appointment...' : isDoctorOnLeave ? `Dr. on Leave on ${selectedDate}` : !getSlotAvailability(selectedSlot).available ? 'Selected Slot Not Available' : 'Confirm Appointment & Send Email'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/patient/book/page.tsx",
                                                lineNumber: 661,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/patient/book/page.tsx",
                                        lineNumber: 514,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/patient/book/page.tsx",
                                    lineNumber: 513,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/patient/book/page.tsx",
                            lineNumber: 436,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/patient/book/page.tsx",
                    lineNumber: 367,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/patient/book/page.tsx",
            lineNumber: 364,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/patient/book/page.tsx",
        lineNumber: 363,
        columnNumber: 5
    }, this);
}
_s(BookAppointmentPage, "6rIq2eNM2BQXxgvL87pKs4HVAF8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = BookAppointmentPage;
var _c;
__turbopack_context__.k.register(_c, "BookAppointmentPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Navbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.mjs [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.mjs [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.mjs [app-client] (ecmascript) <export default as User>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Navbar() {
    _s();
    const { user, logout, isAuthenticated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "flex items-center gap-2 text-emerald-400 font-extrabold text-lg tracking-tight",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                            className: "w-6 h-6 text-emerald-400"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Navbar.tsx",
                            lineNumber: 14,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-white",
                            children: "Prime"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Navbar.tsx",
                            lineNumber: 15,
                            columnNumber: 11
                        }, this),
                        "Care"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Navbar.tsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-4 text-xs font-semibold",
                    children: isAuthenticated && user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-slate-300 hidden sm:inline flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                        className: "w-4 h-4 text-emerald-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Navbar.tsx",
                                        lineNumber: 21,
                                        columnNumber: 17
                                    }, this),
                                    " ",
                                    user.firstName || user.email
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Navbar.tsx",
                                lineNumber: 20,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: logout,
                                className: "px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/Navbar.tsx",
                                        lineNumber: 27,
                                        columnNumber: 17
                                    }, this),
                                    " Logout"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/Navbar.tsx",
                                lineNumber: 23,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Navbar.tsx",
                        lineNumber: 19,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/login",
                                className: "px-4 py-2 rounded-xl text-slate-300 hover:text-white transition",
                                children: "Sign In"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Navbar.tsx",
                                lineNumber: 32,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/signup",
                                className: "px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20",
                                children: "Sign Up"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Navbar.tsx",
                                lineNumber: 38,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Navbar.tsx",
                        lineNumber: 31,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/Navbar.tsx",
                    lineNumber: 17,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Navbar.tsx",
            lineNumber: 12,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/Navbar.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_s(Navbar, "aa1l+qMc41LKvM6tS2kPjnFXLJs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = Navbar;
var _c;
__turbopack_context__.k.register(_c, "Navbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ProtectedRoute.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProtectedRoute
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AuthContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function ProtectedRoute({ children, allowedRoles }) {
    _s();
    const { user, isAuthenticated, loading, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProtectedRoute.useEffect": ()=>{
            if (!loading) {
                if (!isAuthenticated || !user) {
                    router.replace("/login");
                    return;
                }
                // STRICT GATE: If role is DOCTOR and not explicitly approved, kick back to login
                if (user.role === "DOCTOR" && user.isApproved !== true) {
                    logout();
                    router.replace("/login");
                    return;
                }
                if (allowedRoles && !allowedRoles.includes(user.role)) {
                    if (user.role === "PATIENT") {
                        router.replace("/patient/book");
                    } else if (user.role === "DOCTOR") {
                        router.replace("/doctor/dashboard");
                    } else if (user.role === "ADMIN") {
                        router.replace("/admin/leaves");
                    }
                }
            }
        }
    }["ProtectedRoute.useEffect"], [
        isAuthenticated,
        loading,
        user,
        allowedRoles,
        router,
        logout
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-mono text-xs",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProtectedRoute.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: "Verifying credentials & clinical authorizations..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProtectedRoute.tsx",
                        lineNumber: 50,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ProtectedRoute.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ProtectedRoute.tsx",
            lineNumber: 47,
            columnNumber: 7
        }, this);
    }
    if (!isAuthenticated || !user || user.role === "DOCTOR" && user.isApproved !== true) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/ProtectedRoute.tsx",
        lineNumber: 60,
        columnNumber: 10
    }, this);
}
_s(ProtectedRoute, "E3U30M913moVQht5TG6IJJYYOus=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ProtectedRoute;
var _c;
__turbopack_context__.k.register(_c, "ProtectedRoute");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_16jj0kt._.js.map