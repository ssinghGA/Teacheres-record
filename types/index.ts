export type Role = 'super_admin' | 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatar?: string;
  phone?: string;
  city?: string;
  subjects?: string[];
  qualification?: string;
  experience?: string;
  bio?: string;
}

export interface Student {
  id: string;
  teacherId: string;
  name: string;
  class: string;
  school: string;
  parentName: string;
  parentPhone: string;
  email: string;
  subject: string;
  startDate: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

export interface ClassSession {
  id: string;
  teacherId: string;
  studentId: string;
  subject: string;
  topic: string;
  date: string;
  time: string;
  duration: number; // in minutes
  ratePerClass: number; // in INR
  notes?: string;
  status: 'completed' | 'upcoming' | 'cancelled';
}

export interface ProgressReport {
  id: string;
  teacherId: string;
  studentId: string;
  subject: string;
  date: string;
  topicCovered: string;
  homeworkGiven: string;
  understandingLevel: number; // 1–5
  remarks: string;
}

export interface Payment {
  id: string;
  teacherId: string;
  studentId: string;
  classId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
