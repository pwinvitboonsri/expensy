import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Plus,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onAddTransaction,
  isCollapsed,
  setIsCollapsed
}) => {
  const { profile, user } = useAuth();
  
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: Receipt },
    { name: "Budgets", path: "/budgets", icon: PieChart },
  ];

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 bg-bg-surface border-r border-border-subtle flex flex-col z-50 transition-all duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      ${isCollapsed ? "lg:w-20" : "lg:w-64 w-64"}
    `}>
      {/* Logo Section */}
      <div className={`px-4 pt-8 pb-10 flex flex-col items-center ${isCollapsed ? "" : "lg:px-8 lg:flex-row lg:justify-between"}`}>
        <div className={isCollapsed ? "hidden lg:hidden" : "block"}>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Expensy</h1>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">
            Architectural Ledger
          </p>
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden lg:flex p-2 text-text-muted hover:text-text-primary hover:bg-bg-main rounded-lg transition-all ${isCollapsed ? "mt-2" : ""}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? "bg-brand-emerald/10 text-brand-emerald" 
                  : "text-text-secondary hover:bg-bg-main hover:text-text-primary"
              } ${isCollapsed ? "justify-center" : ""}`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className={`text-sm font-semibold transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 absolute" : "opacity-100"}`}>
              {item.name}
            </span>
            {!isCollapsed && (
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-3 h-3" />
              </div>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-text-primary text-bg-surface text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] shadow-xl">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 space-y-4">
        {/* Add Transaction Button */}
        <button 
          onClick={() => {
            onAddTransaction();
            if (window.innerWidth < 1024) onClose();
          }}
          className={`w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all font-bold text-sm ${isCollapsed ? "px-0" : ""}`}
          title={isCollapsed ? "Add Transaction" : ""}
        >
          <Plus className="w-5 h-5" />
          <span className={`transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 absolute" : "opacity-100"}`}>
            Add Transaction
          </span>
        </button>

        {/* Profile Card */}
        <NavLink 
          to="/settings"
          onClick={() => {
            if (window.innerWidth < 1024) onClose();
          }}
          className={({ isActive }) => 
            `flex items-center gap-3 px-1 py-4 border-t border-border-subtle overflow-hidden transition-all duration-200 group relative ${
              isActive ? "bg-brand-emerald/5" : "hover:bg-bg-main"
            } ${isCollapsed ? "justify-center" : ""}`
          }
        >
          <div className="w-10 h-10 rounded-full bg-bg-main flex-shrink-0 overflow-hidden border border-border-subtle group-hover:border-brand-emerald/30 transition-colors">
            <img 
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || "User"}&background=random`} 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 absolute" : "opacity-100"}`}>
            <p className="text-sm font-bold text-text-primary truncate group-hover:text-brand-emerald transition-colors">
              {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Expensy User"}
            </p>
            <p className="text-[10px] text-text-secondary font-medium truncate tracking-tight lowercase">
              {user?.email || "architect@expensy.app"}
            </p>
          </div>

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-text-primary text-bg-surface text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] shadow-xl">
              Settings
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
