import { User, Student, ClassSession, ProgressReport, Payment } from '@/types';

export const MOCK_USERS: User[] = [
    {
        id: 'u1',
        name: 'Rajesh Kumar',
        email: 'superadmin@school.com',
        password: 'admin123',
        role: 'super_admin',
        phone: '+91 98765 43210',
        city: 'Mumbai',
        subjects: ['Mathematics', 'Physics'],
        qualification: 'M.Sc. Mathematics',
        experience: '15 years',
        bio: 'Super Admin with full system access.',
        avatar: '',
    },
    {
        id: 'u2',
        name: 'Priya Sharma',
        email: 'admin@school.com',
        password: 'admin123',
        role: 'admin',
        phone: '+91 87654 32109',
        city: 'Delhi',
        subjects: ['English', 'Hindi'],
        qualification: 'M.A. English',
        experience: '10 years',
        bio: 'Admin managing teachers and students.',
        avatar: '',
    },
    {
        id: 'u3',
        name: 'Amit Singh',
        email: 'teacher@school.com',
        password: 'teacher123',
        role: 'teacher',
        phone: '+91 76543 21098',
        city: 'Bangalore',
        subjects: ['Science', 'Mathematics'],
        qualification: 'B.Sc. Physics',
        experience: '5 years',
        bio: 'Passionate about making science fun and accessible.',
        avatar: '',
    },
    {
        id: 'u4',
        name: 'Sunita Patel',
        email: 'teacher2@school.com',
        password: 'teacher123',
        role: 'teacher',
        phone: '+91 65432 10987',
        city: 'Pune',
        subjects: ['Mathematics', 'Chemistry'],
        qualification: 'M.Sc. Chemistry',
        experience: '8 years',
        bio: 'Dedicated to helping students excel in mathematics.',
        avatar: '',
    },
    {
        id: 'u5',
        name: 'Vikram Nair',
        email: 'teacher3@school.com',
        password: 'teacher123',
        role: 'teacher',
        phone: '+91 54321 09876',
        city: 'Chennai',
        subjects: ['English', 'History'],
        qualification: 'M.A. History',
        experience: '12 years',
        bio: 'History enthusiast with modern teaching methods.',
        avatar: '',
    },
];

export const MOCK_STUDENTS: Student[] = [
    {
        id: 's1', teacherId: 'u3', name: 'Arjun Mehta', class: '10th', school: 'DPS Mumbai',
        parentName: 'Rakesh Mehta', parentPhone: '+91 99887 76655', email: 'arjun@gmail.com',
        subject: 'Mathematics', startDate: '2024-01-15', status: 'active',
    },
    {
        id: 's2', teacherId: 'u3', name: 'Pooja Iyer', class: '9th', school: 'Ryan International',
        parentName: 'Suresh Iyer', parentPhone: '+91 88776 65544', email: 'pooja@gmail.com',
        subject: 'Science', startDate: '2024-02-01', status: 'active',
    },
    {
        id: 's3', teacherId: 'u3', name: 'Rohan Gupta', class: '11th', school: 'Kendriya Vidyalaya',
        parentName: 'Anil Gupta', parentPhone: '+91 77665 54433', email: 'rohan@gmail.com',
        subject: 'Physics', startDate: '2024-01-10', status: 'active',
    },
    {
        id: 's4', teacherId: 'u3', name: 'Sneha Kapoor', class: '8th', school: 'St. Xavier\'s',
        parentName: 'Vijay Kapoor', parentPhone: '+91 66554 43322', email: 'sneha@gmail.com',
        subject: 'Mathematics', startDate: '2024-03-05', status: 'inactive',
    },
    {
        id: 's5', teacherId: 'u4', name: 'Kartik Reddy', class: '12th', school: 'DAV Public School',
        parentName: 'Mohan Reddy', parentPhone: '+91 55443 32211', email: 'kartik@gmail.com',
        subject: 'Chemistry', startDate: '2024-01-20', status: 'active',
    },
    {
        id: 's6', teacherId: 'u4', name: 'Divya Rao', class: '10th', school: 'Modern School',
        parentName: 'Ramesh Rao', parentPhone: '+91 44332 21100', email: 'divya@gmail.com',
        subject: 'Mathematics', startDate: '2024-02-15', status: 'active',
    },
    {
        id: 's7', teacherId: 'u5', name: 'Aditya Joshi', class: '9th', school: 'DPS Delhi',
        parentName: 'Sunil Joshi', parentPhone: '+91 33221 10099', email: 'aditya@gmail.com',
        subject: 'History', startDate: '2024-03-01', status: 'active',
    },
    {
        id: 's8', teacherId: 'u5', name: 'Prachi Bhatt', class: '11th', school: 'Amity School',
        parentName: 'Kiran Bhatt', parentPhone: '+91 22110 00988', email: 'prachi@gmail.com',
        subject: 'English', startDate: '2024-01-25', status: 'pending',
    },
];

export const MOCK_CLASSES: ClassSession[] = [
    { id: 'c1', teacherId: 'u3', studentId: 's1', subject: 'Mathematics', topic: 'Quadratic Equations', date: '2026-03-01', time: '10:00', duration: 60, ratePerClass: 500, notes: 'Practice problems given', status: 'completed' },
    { id: 'c2', teacherId: 'u3', studentId: 's2', subject: 'Science', topic: 'Photosynthesis', date: '2026-03-02', time: '14:00', duration: 60, ratePerClass: 500, notes: 'Diagram explanation', status: 'completed' },
    { id: 'c3', teacherId: 'u3', studentId: 's3', subject: 'Physics', topic: 'Newton\'s Laws', date: '2026-03-03', time: '11:00', duration: 90, ratePerClass: 600, notes: 'Numerical problems', status: 'completed' },
    { id: 'c4', teacherId: 'u3', studentId: 's1', subject: 'Mathematics', topic: 'Trigonometry', date: '2026-03-05', time: '10:00', duration: 60, ratePerClass: 500, notes: '', status: 'completed' },
    { id: 'c5', teacherId: 'u3', studentId: 's2', subject: 'Science', topic: 'Cell Division', date: '2026-03-07', time: '14:00', duration: 60, ratePerClass: 500, notes: '', status: 'completed' },
    { id: 'c6', teacherId: 'u3', studentId: 's1', subject: 'Mathematics', topic: 'Coordinate Geometry', date: '2026-03-10', time: '10:00', duration: 60, ratePerClass: 500, notes: '', status: 'upcoming' },
    { id: 'c7', teacherId: 'u3', studentId: 's3', subject: 'Physics', topic: 'Thermodynamics', date: '2026-03-12', time: '11:00', duration: 90, ratePerClass: 600, notes: '', status: 'upcoming' },
    { id: 'c8', teacherId: 'u4', studentId: 's5', subject: 'Chemistry', topic: 'Organic Chemistry', date: '2026-03-01', time: '09:00', duration: 60, ratePerClass: 550, notes: '', status: 'completed' },
    { id: 'c9', teacherId: 'u4', studentId: 's6', subject: 'Mathematics', topic: 'Calculus', date: '2026-03-04', time: '15:00', duration: 60, ratePerClass: 500, notes: '', status: 'completed' },
    { id: 'c10', teacherId: 'u5', studentId: 's7', subject: 'History', topic: 'Independence Movement', date: '2026-03-03', time: '13:00', duration: 60, ratePerClass: 450, notes: '', status: 'completed' },
];

export const MOCK_REPORTS: ProgressReport[] = [
    { id: 'r1', teacherId: 'u3', studentId: 's1', subject: 'Mathematics', date: '2026-03-01', topicCovered: 'Quadratic Equations', homeworkGiven: 'Exercise 4.3 Q1-Q10', understandingLevel: 4, remarks: 'Good progress. Needs more practice on discriminant.' },
    { id: 'r2', teacherId: 'u3', studentId: 's2', subject: 'Science', date: '2026-03-02', topicCovered: 'Photosynthesis', homeworkGiven: 'Draw and label chloroplast', understandingLevel: 5, remarks: 'Excellent understanding. Engaged well.' },
    { id: 'r3', teacherId: 'u3', studentId: 's3', subject: 'Physics', date: '2026-03-03', topicCovered: 'Newton\'s Laws', homeworkGiven: 'Solve 5 numerical problems', understandingLevel: 3, remarks: 'Struggling with application problems. Extra practice needed.' },
    { id: 'r4', teacherId: 'u4', studentId: 's5', subject: 'Chemistry', date: '2026-03-01', topicCovered: 'Organic Reactions', homeworkGiven: 'Identify reaction types', understandingLevel: 4, remarks: 'Good grasp of concepts.' },
];

export const MOCK_PAYMENTS: Payment[] = [
    { id: 'p1', teacherId: 'u3', studentId: 's1', classId: 'c1', amount: 500, date: '2026-03-01', status: 'paid' },
    { id: 'p2', teacherId: 'u3', studentId: 's2', classId: 'c2', amount: 500, date: '2026-03-02', status: 'paid' },
    { id: 'p3', teacherId: 'u3', studentId: 's3', classId: 'c3', amount: 600, date: '2026-03-03', status: 'paid' },
    { id: 'p4', teacherId: 'u3', studentId: 's1', classId: 'c4', amount: 500, date: '2026-03-05', status: 'paid' },
    { id: 'p5', teacherId: 'u3', studentId: 's2', classId: 'c5', amount: 500, date: '2026-03-07', status: 'pending' },
    { id: 'p6', teacherId: 'u4', studentId: 's5', classId: 'c8', amount: 550, date: '2026-03-01', status: 'paid' },
    { id: 'p7', teacherId: 'u4', studentId: 's6', classId: 'c9', amount: 500, date: '2026-03-04', status: 'pending' },
    { id: 'p8', teacherId: 'u5', studentId: 's7', classId: 'c10', amount: 450, date: '2026-03-03', status: 'paid' },
];
