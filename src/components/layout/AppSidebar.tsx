import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Building, Building2, Users, LayoutDashboard, UserCog, Menu } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { isAdmin } = useAuth();
  
  const {
    colleges,
    institutions,
    selectedCollegeId,
    selectedInstitutionId,
    setSelectedCollegeId,
    setSelectedInstitutionId,
  } = useStore();

  const [expandedColleges, setExpandedColleges] = useState<Set<string>>(new Set());

  const toggleCollege = (collegeId: string) => {
    const newExpanded = new Set(expandedColleges);
    if (newExpanded.has(collegeId)) {
      newExpanded.delete(collegeId);
    } else {
      newExpanded.add(collegeId);
    }
    setExpandedColleges(newExpanded);
  };

  const handleCollegeClick = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
    toggleCollege(collegeId);
    navigate(`/dashboard/colleges/${collegeId}`);
  };

  const handleInstitutionClick = (institutionId: string) => {
    setSelectedInstitutionId(institutionId);
    navigate(`/dashboard/institutions/${institutionId}`);
  };

  const isActive = (path: string) => location.pathname === path;

  const getCollegeInstitutions = (collegeId: string) => 
    institutions.filter(i => i.collegeId === collegeId);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-sidebar-foreground text-sm">Campus S&L</h1>
              <p className="text-xs text-sidebar-foreground/70">Management System</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/dashboard')}
                  className={cn(
                    'w-full justify-start gap-3 transition-all duration-200',
                    isActive('/dashboard') && 'bg-sidebar-primary text-sidebar-primary-foreground'
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {!collapsed && <span>Dashboard</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/dashboard/users')}
                  className={cn(
                    'w-full justify-start gap-3 transition-all duration-200',
                    isActive('/dashboard/users') && 'bg-sidebar-primary text-sidebar-primary-foreground'
                  )}
                >
                  <UserCog className="h-4 w-4" />
                  {!collapsed && <span>Users</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Colleges Hierarchy */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
            Organization
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {colleges.map((college) => (
                <div key={college.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleCollegeClick(college.id)}
                      className={cn(
                        'w-full justify-start gap-2 transition-all duration-200',
                        selectedCollegeId === college.id && 'bg-sidebar-accent text-accent'
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {!collapsed && (
                          expandedColleges.has(college.id) 
                            ? <ChevronDown className="h-3 w-3 flex-shrink-0" />
                            : <ChevronRight className="h-3 w-3 flex-shrink-0" />
                        )}
                        <Building className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && (
                          <span className="truncate text-sm">{college.code}</span>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {/* Institutions under College */}
                  {!collapsed && expandedColleges.has(college.id) && (
                    <div className="ml-6 space-y-1 animate-slide-up">
                      {getCollegeInstitutions(college.id).map((inst) => (
                        <SidebarMenuItem key={inst.id}>
                          <SidebarMenuButton
                            onClick={() => handleInstitutionClick(inst.id)}
                            className={cn(
                              'w-full justify-start gap-2 text-sm pl-4 transition-all duration-200',
                              selectedInstitutionId === inst.id && 'bg-sidebar-primary text-sidebar-primary-foreground'
                            )}
                          >
                            <Users className="h-3 w-3" />
                            <span className="truncate">{inst.code}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
