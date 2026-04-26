import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Menu,
  ChevronRight
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/transactions") return "Transactions";
    if (path === "/budgets") return "Budgets";
    if (path === "/analytics") return "Analytics";
    if (path === "/settings") return "Settings";
    return "Overview";
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <header className="h-20 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-4 md:px-8 z-40 transition-colors duration-300">
      <div className="flex items-center gap-2 md:gap-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Expensy</span>
            <ChevronRight className="w-3 h-3 text-text-muted/50" />
            <span className="text-[10px] font-bold text-brand-emerald uppercase tracking-[0.2em]">{getPageTitle()}</span>
          </div>
          
          <div className="w-[1px] h-4 bg-border-subtle mx-2" />
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">{today}</span>
          </div>
        </div>

        {/* Mobile Title */}
        <div className="md:hidden">
          <span className="text-xs font-bold text-text-primary uppercase tracking-widest">{getPageTitle()}</span>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1 md:gap-3">
        <button
          onClick={toggleTheme}
          className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-xl transition-all"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <button className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-xl transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-emerald rounded-full border-2 border-bg-surface"></span>
        </button>

        <Link to="/settings" className="hidden sm:flex p-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-xl transition-all">
          <SettingsIcon className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
};

export default TopBar;
