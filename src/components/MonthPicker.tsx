import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from "lucide-react";

interface MonthPickerProps {
  value: string; // YYYY-MM
  onChange: (date: string) => void;
  align?: "left" | "right";
}

const MonthPicker: React.FC<MonthPickerProps> = ({ value, onChange, align = "left" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value ? parseInt(value.split('-')[0]) : new Date().getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevYear = () => setViewYear(prev => prev - 1);
  const handleNextYear = () => setViewYear(prev => prev + 1);

  const handleMonthClick = (monthIndex: number) => {
    const month = String(monthIndex + 1).padStart(2, '0');
    onChange(`${viewYear}-${month}`);
    setIsOpen(false);
  };

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const currentMonthValue = value || new Date().toISOString().slice(0, 7);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-transparent border border-transparent hover:border-border-subtle rounded-xl py-2 px-4 text-xs font-black text-text-primary flex items-center justify-between transition-all outline-none group"
      >
        <span>
          {value ? new Date(value + "-01").toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "Select Month"}
        </span>
        <ChevronDown className={`w-3 h-3 text-text-muted group-hover:text-brand-emerald transition-all ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-2 ${align === "right" ? "right-0" : "left-0"} w-64 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl z-[100] p-4 animate-in fade-in zoom-in slide-in-from-top-2 duration-200`}>
          <div className="flex items-center justify-between mb-4 px-1">
            <button onClick={handlePrevYear} className="p-1 hover:bg-bg-main rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <span className="text-sm font-black text-text-primary tracking-widest">
              {viewYear}
            </span>
            <button onClick={handleNextYear} className="p-1 hover:bg-bg-main rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {monthNames.map((month, i) => {
              const monthValue = `${viewYear}-${String(i + 1).padStart(2, '0')}`;
              const isSelected = currentMonthValue === monthValue;
              const isThisMonth = new Date().toISOString().slice(0, 7) === monthValue;
              
              return (
                <button
                  key={month}
                  onClick={() => handleMonthClick(i)}
                  className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    isSelected 
                      ? "bg-brand-emerald text-white shadow-lg shadow-emerald-500/20" 
                      : isThisMonth
                        ? "bg-brand-emerald/10 text-brand-emerald"
                        : "text-text-muted hover:bg-bg-main hover:text-text-primary"
                  }`}
                >
                  {month}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border-subtle flex justify-center">
            <button
              onClick={() => {
                const now = new Date();
                onChange(now.toISOString().slice(0, 7));
                setViewYear(now.getFullYear());
                setIsOpen(false);
              }}
              className="text-[10px] font-black text-brand-emerald hover:text-brand-emerald-dark uppercase tracking-[0.4em] transition-colors"
            >
              Month
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthPicker;
