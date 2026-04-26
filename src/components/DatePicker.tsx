import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  align?: "left" | "right";
  side?: "right" | "bottom";
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder, align = "left", side = "bottom" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
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

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format as YYYY-MM-DD
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${d}`);
    setIsOpen(false);
  };

  const renderDays = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    // Fill empty slots for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = value && new Date(value).toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
      const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-8 w-8 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
            isSelected 
              ? "bg-brand-emerald text-white shadow-lg shadow-emerald-500/20" 
              : isToday
                ? "bg-brand-emerald/10 text-brand-emerald"
                : "text-text-secondary hover:bg-bg-main hover:text-text-primary"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-bg-main border border-border-subtle rounded-xl py-2 px-3 text-[10px] font-bold text-text-primary flex items-center justify-between hover:bg-bg-main/80 transition-all outline-none"
      >
        <span className={!value ? "text-text-muted" : ""}>
          {value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : placeholder}
        </span>
        <CalendarIcon className="w-3 h-3 text-text-muted" />
      </button>

      {isOpen && (
        <div className={`absolute ${side === "right" ? "top-0 left-full ml-4" : `top-full mt-2 ${align === "right" ? "right-0" : "left-0"}`} w-64 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl z-[100] p-4 animate-in fade-in zoom-in slide-in-from-left-2 duration-200`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-bg-main rounded-lg transition-colors">
              <ChevronLeft className="w-3.5 h-3.5 text-text-secondary" />
            </button>
            <span className="text-[10px] font-extrabold text-text-primary uppercase tracking-widest">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-bg-main rounded-lg transition-colors">
              <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="h-8 w-8 flex items-center justify-center text-[8px] font-black text-text-muted uppercase tracking-tighter">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderDays()}
          </div>

          <div className="mt-4 pt-4 border-t border-border-subtle flex justify-center">
            <button
              onClick={() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                onChange(`${year}-${month}-${day}`);
                setIsOpen(false);
              }}
              className="text-[10px] font-bold text-brand-emerald hover:text-brand-emerald-dark uppercase tracking-widest transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
