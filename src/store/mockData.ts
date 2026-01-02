// Mock data for Arbaminch University Savings and Loan Management System

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

// Ethiopian first names
const firstNames = [
  'Abebe', 'Almaz', 'Bekele', 'Biruk', 'Chaltu', 'Daniel', 'Dawit', 'Eleni', 'Ermias', 'Eyerusalem',
  'Fasil', 'Fikirte', 'Getachew', 'Girma', 'Hana', 'Hailu', 'Haben', 'Kidist', 'Kebede', 'Kiros',
  'Lemlem', 'Mekdes', 'Meseret', 'Mulugeta', 'Nardos', 'Negash', 'Rahel', 'Samuel', 'Sara', 'Selamawit',
  'Solomon', 'Tadesse', 'Tekle', 'Tesfaye', 'Tigist', 'Tsehay', 'Wondwosen', 'Yared', 'Yeshi', 'Yohannes',
  'Zerihun', 'Zewditu', 'Abnet', 'Alem', 'Aster', 'Berhanu', 'Desta', 'Ephrem', 'Fitsum', 'Genet',
  'Helen', 'Isaac', 'Jerusalem', 'Kassahun', 'Liya', 'Meron', 'Naod', 'Petros', 'Ruth', 'Selam',
  'Tewodros', 'Yonas', 'Zena', 'Abel', 'Amanuel', 'Bethlehem', 'Eden', 'Ezra', 'Haddis', 'Konjit',
  'Martha', 'Mihret', 'Nebiyu', 'Robel', 'Senait', 'Sisay', 'Tamrat', 'Wendim', 'Yemisrach', 'Zelalem'
];

// Ethiopian last names
const lastNames = [
  'Abera', 'Adefris', 'Alemu', 'Asefa', 'Ayele', 'Bekele', 'Belay', 'Desta', 'Eshetu', 'Gebre',
  'Gebrehiwot', 'Gebremariam', 'Getahun', 'Girma', 'Haile', 'Hailu', 'Kebede', 'Kifle', 'Mekonnen', 'Mengistu',
  'Mulatu', 'Negash', 'Seyoum', 'Tadesse', 'Tefera', 'Tekle', 'Tessema', 'Woldemariam', 'Worku', 'Yilma',
  'Zerihun', 'Zewde', 'Admasu', 'Alemayehu', 'Assefa', 'Berhe', 'Debebe', 'Demissie', 'Endale', 'Fantahun',
  'Girmay', 'Hagos', 'Kassa', 'Legesse', 'Melaku', 'Nigussie', 'Regassa', 'Shiferaw', 'Tamiru', 'Wolde'
];

// Initial mock data - Colleges at Arbaminch University
export const initialColleges: College[] = [
  { id: 'col-1', name: 'College of Engineering and Technology', code: 'CoET', head: 'Dr. Tesfaye Abera' },
  { id: 'col-2', name: 'College of Natural and Computational Sciences', code: 'CNCS', head: 'Dr. Solomon Bekele' },
  { id: 'col-3', name: 'College of Social Sciences and Humanities', code: 'CSSH', head: 'Prof. Mulugeta Desta' },
  { id: 'col-4', name: 'College of Business and Economics', code: 'CBE', head: 'Dr. Almaz Girma' },
  { id: 'col-5', name: 'College of Agricultural Sciences', code: 'CoAS', head: 'Dr. Kebede Hailu' },
  { id: 'col-6', name: 'College of Medicine and Health Sciences', code: 'CMHS', head: 'Dr. Hana Mekonnen' },
];

export const initialInstitutions: Institution[] = [
  // College of Engineering and Technology (CoET)
  { id: 'inst-1', collegeId: 'col-1', name: 'Department of Computer Science and Engineering', code: 'CSE', head: 'Dr. Daniel Yilma', memberCount: 52 },
  { id: 'inst-2', collegeId: 'col-1', name: 'Department of Electrical and Computer Engineering', code: 'ECE', head: 'Dr. Ermias Tadesse', memberCount: 48 },
  { id: 'inst-3', collegeId: 'col-1', name: 'Department of Civil Engineering', code: 'CIVIL', head: 'Dr. Girma Worku', memberCount: 55 },
  { id: 'inst-4', collegeId: 'col-1', name: 'Department of Mechanical Engineering', code: 'MECH', head: 'Dr. Hailu Tefera', memberCount: 50 },
  { id: 'inst-5', collegeId: 'col-1', name: 'Department of Water Resources and Irrigation Engineering', code: 'WRIE', head: 'Dr. Yohannes Gebre', memberCount: 45 },
  
  // College of Natural and Computational Sciences (CNCS)
  { id: 'inst-6', collegeId: 'col-2', name: 'Department of Mathematics', code: 'MATH', head: 'Dr. Bekele Alemu', memberCount: 38 },
  { id: 'inst-7', collegeId: 'col-2', name: 'Department of Physics', code: 'PHYS', head: 'Dr. Fasil Kebede', memberCount: 35 },
  { id: 'inst-8', collegeId: 'col-2', name: 'Department of Chemistry', code: 'CHEM', head: 'Dr. Selamawit Haile', memberCount: 42 },
  { id: 'inst-9', collegeId: 'col-2', name: 'Department of Biology', code: 'BIO', head: 'Dr. Meseret Negash', memberCount: 40 },
  { id: 'inst-10', collegeId: 'col-2', name: 'Department of Statistics', code: 'STAT', head: 'Dr. Kidist Tadesse', memberCount: 32 },
  
  // College of Social Sciences and Humanities (CSSH)
  { id: 'inst-11', collegeId: 'col-3', name: 'Department of English Language and Literature', code: 'ENG', head: 'Prof. Yared Tessema', memberCount: 35 },
  { id: 'inst-12', collegeId: 'col-3', name: 'Department of History and Heritage Management', code: 'HIST', head: 'Prof. Tekle Seyoum', memberCount: 28 },
  { id: 'inst-13', collegeId: 'col-3', name: 'Department of Geography and Environmental Studies', code: 'GEO', head: 'Dr. Wondwosen Mengistu', memberCount: 32 },
  { id: 'inst-14', collegeId: 'col-3', name: 'Department of Psychology', code: 'PSY', head: 'Dr. Eleni Kassa', memberCount: 30 },
  { id: 'inst-15', collegeId: 'col-3', name: 'Department of Sociology', code: 'SOC', head: 'Dr. Tsehay Legesse', memberCount: 28 },
  
  // College of Business and Economics (CBE)
  { id: 'inst-16', collegeId: 'col-4', name: 'Department of Accounting and Finance', code: 'ACFN', head: 'Dr. Biruk Shiferaw', memberCount: 45 },
  { id: 'inst-17', collegeId: 'col-4', name: 'Department of Management', code: 'MGMT', head: 'Dr. Fikirte Tamiru', memberCount: 42 },
  { id: 'inst-18', collegeId: 'col-4', name: 'Department of Economics', code: 'ECON', head: 'Dr. Dawit Wolde', memberCount: 38 },
  { id: 'inst-19', collegeId: 'col-4', name: 'Department of Marketing Management', code: 'MKTG', head: 'Dr. Rahel Fantahun', memberCount: 35 },
  
  // College of Agricultural Sciences (CoAS)
  { id: 'inst-20', collegeId: 'col-5', name: 'Department of Plant Sciences', code: 'PLNT', head: 'Dr. Getachew Berhe', memberCount: 40 },
  { id: 'inst-21', collegeId: 'col-5', name: 'Department of Animal and Range Sciences', code: 'ANRS', head: 'Dr. Chaltu Regassa', memberCount: 38 },
  { id: 'inst-22', collegeId: 'col-5', name: 'Department of Rural Development and Agricultural Extension', code: 'RDAE', head: 'Dr. Lemlem Debebe', memberCount: 35 },
  { id: 'inst-23', collegeId: 'col-5', name: 'Department of Food Science and Postharvest Technology', code: 'FSPT', head: 'Dr. Nardos Demissie', memberCount: 32 },
  
  // College of Medicine and Health Sciences (CMHS)
  { id: 'inst-24', collegeId: 'col-6', name: 'Department of Medicine', code: 'MED', head: 'Dr. Samuel Endale', memberCount: 60 },
  { id: 'inst-25', collegeId: 'col-6', name: 'Department of Nursing', code: 'NURS', head: 'Dr. Sara Melaku', memberCount: 55 },
  { id: 'inst-26', collegeId: 'col-6', name: 'Department of Public Health', code: 'PUBH', head: 'Dr. Mekdes Nigussie', memberCount: 45 },
  { id: 'inst-27', collegeId: 'col-6', name: 'Department of Pharmacy', code: 'PHAR', head: 'Dr. Tigist Admasu', memberCount: 40 },
];

// Generate members dynamically
const generateMembers = (): Member[] => {
  const members: Member[] = [];
  let memberId = 1;
  let employeeNum = 1000;
  
  initialInstitutions.forEach(inst => {
    const memberCount = 50 + Math.floor(Math.random() * 10); // 50-60 members per dept
    
    for (let i = 0; i < memberCount; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const status: ('active' | 'inactive' | 'suspended')[] = ['active', 'active', 'active', 'active', 'inactive', 'suspended'];
      const randomStatus = status[Math.floor(Math.random() * status.length)];
      const joinYear = 2015 + Math.floor(Math.random() * 10);
      const joinMonth = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
      const joinDay = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
      
      members.push({
        id: `mem-${memberId}`,
        institutionId: inst.id,
        collegeId: inst.collegeId,
        name: `${firstName} ${lastName}`,
        employeeId: `AMU${String(employeeNum).padStart(5, '0')}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@amu.edu.et`,
        phone: `+251 ${9}${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: randomStatus,
        joinDate: `${joinYear}-${joinMonth}-${joinDay}`,
      });
      
      memberId++;
      employeeNum++;
    }
  });
  
  return members;
};

// Generate savings dynamically based on members
const generateSavings = (members: Member[]): Saving[] => {
  const savings: Saving[] = [];
  let savingId = 1;
  
  members.forEach(member => {
    if (member.status !== 'active') return;
    
    // Random number of months they've been saving (12-48)
    const monthsSaving = 12 + Math.floor(Math.random() * 36);
    const monthlyAmount = (500 + Math.floor(Math.random() * 4500)); // 500-5000 ETB monthly
    const interestRate = 0.005; // 0.5% monthly interest
    let runningBalance = 0;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsSaving);
    
    for (let i = 0; i < monthsSaving; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      
      const interest = Math.round(runningBalance * interestRate);
      runningBalance += monthlyAmount + interest;
      
      // Only keep recent 6 months of detailed records
      if (i >= monthsSaving - 6) {
        savings.push({
          id: `sav-${savingId}`,
          memberId: member.id,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          amount: monthlyAmount,
          interest: interest,
          balance: runningBalance,
          createdAt: date.toISOString().split('T')[0],
        });
        savingId++;
      }
    }
  });
  
  return savings;
};

// Generate loans dynamically based on members - ALL members get loans
const generateLoans = (members: Member[]): Loan[] => {
  const loans: Loan[] = [];
  let loanId = 1;
  
  // All active members have at least one loan
  const activeMembers = members.filter(m => m.status === 'active');
  
  activeMembers.forEach(member => {
    const amount = (10000 + Math.floor(Math.random() * 190000)); // 10,000 - 200,000 ETB
    const interestRate = 8 + Math.floor(Math.random() * 7); // 8-14%
    const tenure = [6, 12, 18, 24, 36][Math.floor(Math.random() * 5)];
    const statuses: ('active' | 'completed' | 'overdue' | 'defaulted')[] = ['active', 'active', 'active', 'completed', 'overdue'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const disbursedDate = new Date();
    disbursedDate.setMonth(disbursedDate.getMonth() - Math.floor(Math.random() * tenure));
    
    const dueDate = new Date(disbursedDate);
    dueDate.setMonth(dueDate.getMonth() + tenure);
    
    const totalPayable = Math.round(amount * (1 + interestRate / 100));
    const amountPaid = status === 'completed' ? totalPayable : Math.round(totalPayable * (0.2 + Math.random() * 0.6));
    
    loans.push({
      id: `loan-${loanId}`,
      memberId: member.id,
      loanNumber: `LN-${disbursedDate.getFullYear()}-${String(loanId).padStart(4, '0')}`,
      amount,
      interestRate,
      tenure,
      status,
      disbursedAt: disbursedDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      totalPayable,
      amountPaid,
    });
    
    loanId++;
  });
  
  return loans;
};

// Generate repayments based on loans
const generateRepayments = (loans: Loan[]): Repayment[] => {
  const repayments: Repayment[] = [];
  let repaymentId = 1;
  
  loans.forEach(loan => {
    if (loan.amountPaid <= 0) return;
    
    // Generate 1-6 repayments per loan
    const numRepayments = 1 + Math.floor(Math.random() * 6);
    let totalPaid = 0;
    const paymentPerRepayment = Math.floor(loan.amountPaid / numRepayments);
    
    for (let i = 0; i < numRepayments; i++) {
      if (totalPaid >= loan.amountPaid) break;
      
      const paidDate = new Date(loan.disbursedAt);
      paidDate.setMonth(paidDate.getMonth() + i + 1);
      
      const methods: ('cash' | 'bank_transfer' | 'salary_deduction')[] = ['cash', 'bank_transfer', 'salary_deduction'];
      const method = methods[Math.floor(Math.random() * methods.length)];
      
      const amount = i === numRepayments - 1 ? loan.amountPaid - totalPaid : paymentPerRepayment;
      
      repayments.push({
        id: `rep-${repaymentId}`,
        loanId: loan.id,
        memberId: loan.memberId,
        amount,
        paidAt: paidDate.toISOString().split('T')[0],
        method,
        reference: `REF-${paidDate.getFullYear()}-${String(repaymentId).padStart(5, '0')}`,
      });
      
      totalPaid += amount;
      repaymentId++;
    }
  });
  
  return repayments;
};

// Generate data
export const initialMembers = generateMembers();
export const initialSavings = generateSavings(initialMembers);
export const initialLoans = generateLoans(initialMembers);
export const initialRepayments = generateRepayments(initialLoans);

export const initialAuditLogs: AuditLog[] = [
  { id: 'aud-1', userId: 'user-1', userName: 'Admin User', action: 'UPDATE', entityType: 'member', entityId: 'mem-1', field: 'phone', oldValue: '+251 912345678', newValue: '+251 987654321', timestamp: '2024-04-10T10:30:00Z' },
  { id: 'aud-2', userId: 'user-2', userName: 'Officer Dawit', action: 'CREATE', entityType: 'loan', entityId: 'loan-4', field: 'amount', oldValue: '', newValue: '200000', timestamp: '2024-03-01T09:15:00Z' },
  { id: 'aud-3', userId: 'user-1', userName: 'Admin User', action: 'UPDATE', entityType: 'saving', entityId: 'sav-1', field: 'amount', oldValue: '4500', newValue: '5000', timestamp: '2024-02-28T14:45:00Z' },
];

export const initialRecentActivity: RecentActivity[] = [
  { id: 'act-1', type: 'repayment', description: 'Loan repayment of ETB 15,000 by Abebe Kebede', user: 'System', timestamp: '2024-04-15T10:00:00Z' },
  { id: 'act-2', type: 'saving', description: 'Monthly saving of ETB 3,000 added for Almaz Bekele', user: 'Officer Dawit', timestamp: '2024-04-14T15:30:00Z' },
  { id: 'act-3', type: 'loan', description: 'New loan application approved for Daniel Hailu', user: 'Admin User', timestamp: '2024-04-12T11:20:00Z' },
  { id: 'act-4', type: 'member', description: 'New member Eleni Tessema registered', user: 'Admin User', timestamp: '2024-04-10T09:00:00Z' },
  { id: 'act-5', type: 'edit', description: 'Profile updated for Girma Alemu', user: 'Officer Sara', timestamp: '2024-04-08T16:45:00Z' },
];
