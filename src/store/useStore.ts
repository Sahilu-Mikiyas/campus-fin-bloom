import { create } from 'zustand';
import {
  College,
  Institution,
  Member,
  Saving,
  Loan,
  Repayment,
  AuditLog,
  RecentActivity,
  initialColleges,
  initialInstitutions,
  initialMembers,
  initialSavings,
  initialLoans,
  initialRepayments,
  initialAuditLogs,
  initialRecentActivity,
} from './mockData';

interface AppState {
  // Data
  colleges: College[];
  institutions: Institution[];
  members: Member[];
  savings: Saving[];
  loans: Loan[];
  repayments: Repayment[];
  auditLogs: AuditLog[];
  recentActivity: RecentActivity[];

  // UI State
  selectedCollegeId: string | null;
  selectedInstitutionId: string | null;
  selectedMemberId: string | null;
  sidebarCollapsed: boolean;

  // Actions - Colleges
  updateCollege: (id: string, data: Partial<College>) => void;

  // Actions - Institutions
  updateInstitution: (id: string, data: Partial<Institution>) => void;

  // Actions - Members
  updateMember: (id: string, data: Partial<Member>) => void;
  addMember: (member: Member) => void;
  deleteMember: (id: string) => void;

  // Actions - Savings
  updateSaving: (id: string, data: Partial<Saving>) => void;
  addSaving: (saving: Saving) => void;
  deleteSaving: (id: string) => void;

  // Actions - Loans
  updateLoan: (id: string, data: Partial<Loan>) => void;
  addLoan: (loan: Loan) => void;

  // Actions - Repayments
  addRepayment: (repayment: Repayment) => void;

  // Actions - Audit
  addAuditLog: (log: AuditLog) => void;
  addActivity: (activity: RecentActivity) => void;

  // Actions - UI
  setSelectedCollegeId: (id: string | null) => void;
  setSelectedInstitutionId: (id: string | null) => void;
  setSelectedMemberId: (id: string | null) => void;
  toggleSidebar: () => void;

  // Computed
  getCollegeStats: (collegeId: string) => { memberCount: number; totalSavings: number; activeLoans: number; overdueLoans: number };
  getInstitutionStats: (institutionId: string) => { memberCount: number; totalSavings: number; activeLoans: number; overdueLoans: number };
  getMemberSavings: (memberId: string) => Saving[];
  getMemberLoans: (memberId: string) => Loan[];
  getMemberRepayments: (memberId: string) => Repayment[];
  getTotalStats: () => { totalMembers: number; totalSavings: number; activeLoans: number; overdueLoans: number };
}

export const useStore = create<AppState>((set, get) => ({
  // Initial data
  colleges: initialColleges,
  institutions: initialInstitutions,
  members: initialMembers,
  savings: initialSavings,
  loans: initialLoans,
  repayments: initialRepayments,
  auditLogs: initialAuditLogs,
  recentActivity: initialRecentActivity,

  // UI State
  selectedCollegeId: null,
  selectedInstitutionId: null,
  selectedMemberId: null,
  sidebarCollapsed: false,

  // College actions
  updateCollege: (id, data) =>
    set((state) => ({
      colleges: state.colleges.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),

  // Institution actions
  updateInstitution: (id, data) =>
    set((state) => ({
      institutions: state.institutions.map((i) => (i.id === id ? { ...i, ...data } : i)),
    })),

  // Member actions
  updateMember: (id, data) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...data } : m)),
    })),
  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),
  deleteMember: (id) =>
    set((state) => ({ members: state.members.filter((m) => m.id !== id) })),

  // Saving actions
  updateSaving: (id, data) =>
    set((state) => ({
      savings: state.savings.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),
  addSaving: (saving) =>
    set((state) => ({ savings: [...state.savings, saving] })),
  deleteSaving: (id) =>
    set((state) => ({ savings: state.savings.filter((s) => s.id !== id) })),

  // Loan actions
  updateLoan: (id, data) =>
    set((state) => ({
      loans: state.loans.map((l) => (l.id === id ? { ...l, ...data } : l)),
    })),
  addLoan: (loan) =>
    set((state) => ({ loans: [...state.loans, loan] })),

  // Repayment actions
  addRepayment: (repayment) =>
    set((state) => ({ repayments: [...state.repayments, repayment] })),

  // Audit actions
  addAuditLog: (log) =>
    set((state) => ({ auditLogs: [log, ...state.auditLogs] })),
  addActivity: (activity) =>
    set((state) => ({ recentActivity: [activity, ...state.recentActivity].slice(0, 20) })),

  // UI actions
  setSelectedCollegeId: (id) => set({ selectedCollegeId: id, selectedInstitutionId: null, selectedMemberId: null }),
  setSelectedInstitutionId: (id) => set({ selectedInstitutionId: id, selectedMemberId: null }),
  setSelectedMemberId: (id) => set({ selectedMemberId: id }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Computed
  getCollegeStats: (collegeId) => {
    const state = get();
    const collegeMembers = state.members.filter((m) => m.collegeId === collegeId);
    const memberIds = collegeMembers.map((m) => m.id);
    const collegeSavings = state.savings.filter((s) => memberIds.includes(s.memberId));
    const collegeLoans = state.loans.filter((l) => memberIds.includes(l.memberId));

    return {
      memberCount: collegeMembers.length,
      totalSavings: collegeSavings.reduce((sum, s) => sum + s.balance, 0),
      activeLoans: collegeLoans.filter((l) => l.status === 'active').length,
      overdueLoans: collegeLoans.filter((l) => l.status === 'overdue' || l.status === 'defaulted').length,
    };
  },

  getInstitutionStats: (institutionId) => {
    const state = get();
    const instMembers = state.members.filter((m) => m.institutionId === institutionId);
    const memberIds = instMembers.map((m) => m.id);
    const instSavings = state.savings.filter((s) => memberIds.includes(s.memberId));
    const instLoans = state.loans.filter((l) => memberIds.includes(l.memberId));

    return {
      memberCount: instMembers.length,
      totalSavings: instSavings.reduce((sum, s) => sum + s.balance, 0),
      activeLoans: instLoans.filter((l) => l.status === 'active').length,
      overdueLoans: instLoans.filter((l) => l.status === 'overdue' || l.status === 'defaulted').length,
    };
  },

  getMemberSavings: (memberId) => get().savings.filter((s) => s.memberId === memberId),
  getMemberLoans: (memberId) => get().loans.filter((l) => l.memberId === memberId),
  getMemberRepayments: (memberId) => get().repayments.filter((r) => r.memberId === memberId),

  getTotalStats: () => {
    const state = get();
    const latestSavings = new Map<string, Saving>();
    state.savings.forEach((s) => {
      const existing = latestSavings.get(s.memberId);
      if (!existing || new Date(s.createdAt) > new Date(existing.createdAt)) {
        latestSavings.set(s.memberId, s);
      }
    });

    return {
      totalMembers: state.members.length,
      totalSavings: Array.from(latestSavings.values()).reduce((sum, s) => sum + s.balance, 0),
      activeLoans: state.loans.filter((l) => l.status === 'active').length,
      overdueLoans: state.loans.filter((l) => l.status === 'overdue' || l.status === 'defaulted').length,
    };
  },
}));
