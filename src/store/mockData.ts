// Mock data for Campus Savings and Loan Management System

export interface College {
  id: string;
  name: string;
  code: string;
  head: string;
}

export interface Institution {
  id: string;
  collegeId: string;
  name: string;
  code: string;
  head: string;
  memberCount: number;
}

export interface Member {
  id: string;
  institutionId: string;
  collegeId: string;
  userId?: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
}

export interface Saving {
  id: string;
  memberId: string;
  year: number;
  month: number;
  amount: number;
  interest: number;
  balance: number;
  createdAt: string;
}

export interface Loan {
  id: string;
  memberId: string;
  loanNumber: string;
  amount: number;
  interestRate: number;
  tenure: number; // months
  status: 'active' | 'completed' | 'overdue' | 'defaulted';
  disbursedAt: string;
  dueDate: string;
  totalPayable: number;
  amountPaid: number;
}

export interface Repayment {
  id: string;
  loanId: string;
  memberId: string;
  amount: number;
  paidAt: string;
  method: 'cash' | 'bank_transfer' | 'salary_deduction';
  reference: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface RecentActivity {
  id: string;
  type: 'saving' | 'loan' | 'repayment' | 'member' | 'edit';
  description: string;
  user: string;
  timestamp: string;
}

// Initial mock data
export const initialColleges: College[] = [
  { id: 'col-1', name: 'College of Engineering', code: 'COE', head: 'Dr. James Wilson' },
  { id: 'col-2', name: 'College of Science', code: 'COS', head: 'Dr. Sarah Chen' },
  { id: 'col-3', name: 'College of Arts', code: 'COA', head: 'Prof. Michael Brown' },
  { id: 'col-4', name: 'College of Business', code: 'COB', head: 'Dr. Emily Davis' },
];

export const initialInstitutions: Institution[] = [
  { id: 'inst-1', collegeId: 'col-1', name: 'Computer Science Department', code: 'CSD', head: 'Dr. Alan Turing', memberCount: 45 },
  { id: 'inst-2', collegeId: 'col-1', name: 'Electrical Engineering', code: 'EE', head: 'Dr. Nikola Tesla', memberCount: 38 },
  { id: 'inst-3', collegeId: 'col-1', name: 'Mechanical Engineering', code: 'ME', head: 'Dr. Henry Ford', memberCount: 52 },
  { id: 'inst-4', collegeId: 'col-2', name: 'Physics Department', code: 'PHY', head: 'Dr. Albert Einstein', memberCount: 28 },
  { id: 'inst-5', collegeId: 'col-2', name: 'Chemistry Department', code: 'CHEM', head: 'Dr. Marie Curie', memberCount: 32 },
  { id: 'inst-6', collegeId: 'col-3', name: 'English Department', code: 'ENG', head: 'Prof. Jane Austen', memberCount: 22 },
  { id: 'inst-7', collegeId: 'col-4', name: 'Finance Department', code: 'FIN', head: 'Dr. Warren Buffett', memberCount: 35 },
];

export const initialMembers: Member[] = [
  { id: 'mem-1', institutionId: 'inst-1', collegeId: 'col-1', name: 'John Smith', employeeId: 'EMP001', email: 'john.smith@university.edu', phone: '555-0101', status: 'active', joinDate: '2020-01-15' },
  { id: 'mem-2', institutionId: 'inst-1', collegeId: 'col-1', name: 'Jane Doe', employeeId: 'EMP002', email: 'jane.doe@university.edu', phone: '555-0102', status: 'active', joinDate: '2019-06-20' },
  { id: 'mem-3', institutionId: 'inst-1', collegeId: 'col-1', name: 'Robert Johnson', employeeId: 'EMP003', email: 'robert.j@university.edu', phone: '555-0103', status: 'active', joinDate: '2021-03-10' },
  { id: 'mem-4', institutionId: 'inst-2', collegeId: 'col-1', name: 'Emily White', employeeId: 'EMP004', email: 'emily.w@university.edu', phone: '555-0104', status: 'active', joinDate: '2018-09-05' },
  { id: 'mem-5', institutionId: 'inst-2', collegeId: 'col-1', name: 'Michael Brown', employeeId: 'EMP005', email: 'michael.b@university.edu', phone: '555-0105', status: 'inactive', joinDate: '2017-02-28' },
  { id: 'mem-6', institutionId: 'inst-4', collegeId: 'col-2', name: 'Sarah Davis', employeeId: 'EMP006', email: 'sarah.d@university.edu', phone: '555-0106', status: 'active', joinDate: '2020-08-12' },
  { id: 'mem-7', institutionId: 'inst-7', collegeId: 'col-4', name: 'David Wilson', employeeId: 'EMP007', email: 'david.w@university.edu', phone: '555-0107', status: 'active', joinDate: '2019-11-30' },
];

export const initialSavings: Saving[] = [
  { id: 'sav-1', memberId: 'mem-1', year: 2024, month: 1, amount: 5000, interest: 250, balance: 55250, createdAt: '2024-01-31' },
  { id: 'sav-2', memberId: 'mem-1', year: 2024, month: 2, amount: 5000, interest: 263, balance: 60513, createdAt: '2024-02-29' },
  { id: 'sav-3', memberId: 'mem-1', year: 2024, month: 3, amount: 5000, interest: 276, balance: 65789, createdAt: '2024-03-31' },
  { id: 'sav-4', memberId: 'mem-2', year: 2024, month: 1, amount: 8000, interest: 400, balance: 88400, createdAt: '2024-01-31' },
  { id: 'sav-5', memberId: 'mem-2', year: 2024, month: 2, amount: 8000, interest: 420, balance: 96820, createdAt: '2024-02-29' },
  { id: 'sav-6', memberId: 'mem-3', year: 2024, month: 1, amount: 3000, interest: 150, balance: 33150, createdAt: '2024-01-31' },
];

export const initialLoans: Loan[] = [
  { id: 'loan-1', memberId: 'mem-1', loanNumber: 'LN-2024-001', amount: 100000, interestRate: 12, tenure: 24, status: 'active', disbursedAt: '2024-01-15', dueDate: '2026-01-15', totalPayable: 124000, amountPaid: 31000 },
  { id: 'loan-2', memberId: 'mem-2', loanNumber: 'LN-2024-002', amount: 50000, interestRate: 10, tenure: 12, status: 'active', disbursedAt: '2024-02-01', dueDate: '2025-02-01', totalPayable: 55000, amountPaid: 27500 },
  { id: 'loan-3', memberId: 'mem-3', loanNumber: 'LN-2023-015', amount: 75000, interestRate: 11, tenure: 18, status: 'completed', disbursedAt: '2023-06-01', dueDate: '2024-12-01', totalPayable: 87375, amountPaid: 87375 },
  { id: 'loan-4', memberId: 'mem-4', loanNumber: 'LN-2024-003', amount: 200000, interestRate: 12, tenure: 36, status: 'active', disbursedAt: '2024-03-01', dueDate: '2027-03-01', totalPayable: 272000, amountPaid: 45000 },
  { id: 'loan-5', memberId: 'mem-5', loanNumber: 'LN-2023-008', amount: 60000, interestRate: 12, tenure: 12, status: 'overdue', disbursedAt: '2023-01-15', dueDate: '2024-01-15', totalPayable: 67200, amountPaid: 40000 },
];

export const initialRepayments: Repayment[] = [
  { id: 'rep-1', loanId: 'loan-1', memberId: 'mem-1', amount: 10000, paidAt: '2024-02-15', method: 'salary_deduction', reference: 'SAL-2024-02-001' },
  { id: 'rep-2', loanId: 'loan-1', memberId: 'mem-1', amount: 10500, paidAt: '2024-03-15', method: 'salary_deduction', reference: 'SAL-2024-03-001' },
  { id: 'rep-3', loanId: 'loan-1', memberId: 'mem-1', amount: 10500, paidAt: '2024-04-15', method: 'salary_deduction', reference: 'SAL-2024-04-001' },
  { id: 'rep-4', loanId: 'loan-2', memberId: 'mem-2', amount: 13750, paidAt: '2024-03-01', method: 'bank_transfer', reference: 'TRF-2024-03-002' },
  { id: 'rep-5', loanId: 'loan-2', memberId: 'mem-2', amount: 13750, paidAt: '2024-04-01', method: 'bank_transfer', reference: 'TRF-2024-04-002' },
];

export const initialAuditLogs: AuditLog[] = [
  { id: 'aud-1', userId: 'user-1', userName: 'Admin User', action: 'UPDATE', entityType: 'member', entityId: 'mem-1', field: 'phone', oldValue: '555-0100', newValue: '555-0101', timestamp: '2024-04-10T10:30:00Z' },
  { id: 'aud-2', userId: 'user-2', userName: 'Officer John', action: 'CREATE', entityType: 'loan', entityId: 'loan-4', field: 'amount', oldValue: '', newValue: '200000', timestamp: '2024-03-01T09:15:00Z' },
  { id: 'aud-3', userId: 'user-1', userName: 'Admin User', action: 'UPDATE', entityType: 'saving', entityId: 'sav-1', field: 'amount', oldValue: '4500', newValue: '5000', timestamp: '2024-02-28T14:45:00Z' },
];

export const initialRecentActivity: RecentActivity[] = [
  { id: 'act-1', type: 'repayment', description: 'Loan repayment of $10,500 by John Smith', user: 'System', timestamp: '2024-04-15T10:00:00Z' },
  { id: 'act-2', type: 'saving', description: 'Monthly saving of $5,000 added for Jane Doe', user: 'Officer John', timestamp: '2024-04-14T15:30:00Z' },
  { id: 'act-3', type: 'loan', description: 'New loan application approved for Emily White', user: 'Admin User', timestamp: '2024-04-12T11:20:00Z' },
  { id: 'act-4', type: 'member', description: 'New member David Wilson registered', user: 'Admin User', timestamp: '2024-04-10T09:00:00Z' },
  { id: 'act-5', type: 'edit', description: 'Profile updated for Michael Brown', user: 'Officer Jane', timestamp: '2024-04-08T16:45:00Z' },
];
