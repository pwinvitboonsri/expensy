import { Link } from "react-router-dom";
import {
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
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
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
