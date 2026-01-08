import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import DashboardLayout from "./layouts/DashboardLayout";
import FinanceLayout from "./layouts/FinanceLayout";
import Dashboard from "./pages/Dashboard";
import CollegePage from "./pages/CollegePage";
import InstitutionPage from "./pages/InstitutionPage";
import MemberProfile from "./pages/MemberProfile";
import MembersDirectory from "./pages/MembersDirectory";
import SavingsOverview from "./pages/SavingsOverview";
import LoansOverview from "./pages/LoansOverview";
import OverdueLoans from "./pages/OverdueLoans";
import UserManagement from "./pages/UserManagement";
import FinanceDashboard from "./pages/FinanceDashboard";
import OrganizationFinances from "./pages/OrganizationFinances";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="colleges/:collegeId" element={<CollegePage />} />
              <Route path="institutions/:institutionId" element={<InstitutionPage />} />
              <Route path="members" element={<MembersDirectory />} />
              <Route path="members/:memberId" element={<MemberProfile />} />
              <Route path="savings" element={<SavingsOverview />} />
              <Route path="loans" element={<LoansOverview />} />
              <Route path="overdue" element={<OverdueLoans />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="monthly-data" element={<FinanceDashboard />} />
              <Route path="organization-finances" element={<OrganizationFinances />} />
            </Route>
            <Route path="/finance" element={<FinanceLayout />}>
              <Route index element={<FinanceDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
