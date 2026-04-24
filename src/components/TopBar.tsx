import { Link } from "react-router-dom";
import {
  Search,
  Bell,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Menu
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-4 md:px-8 z-40 transition-colors duration-300">
      {/* Search Area */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative group max-w-md w-full hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-emerald transition-colors" />
          <input
            type="text"
            placeholder="Search architectural records..."
            className="w-full bg-bg-main border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all placeholder:text-text-muted text-text-primary"
          />
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
