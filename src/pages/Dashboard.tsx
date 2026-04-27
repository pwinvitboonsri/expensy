import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Music,
  Heart,
  Landmark,
  Tag,
  Plus,
  Lock,
  Calendar as CalendarIcon,
  Trash2,
  Settings2,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import "../utils/ChartSetup";
import DatePicker from "../components/DatePicker";
import MonthPicker from "../components/MonthPicker";

// --- Sub-Components ---

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('food') || n.includes('dining') || n.includes('meal')) return UtensilsCrossed;
  if (n.includes('transport') || n.includes('car') || n.includes('fuel')) return Car;
  if (n.includes('house') || n.includes('rent') || n.includes('utility')) return Landmark;
  if (n.includes('health') || n.includes('medical')) return Heart;
  if (n.includes('shop')) return ShoppingBag;
  if (n.includes('entertainment') || n.includes('music')) return Music;
  return Tag;
};

const TransactionItem = ({ icon: Icon, title, category, time, amount, status, isPositive }: any) => (
  <div className="flex items-center justify-between py-5 border-b border-border-subtle last:border-0 group hover:bg-bg-main/50 transition-colors px-4 -mx-4 rounded-xl">
    <div className="flex items-center gap-4">
      <div className={`p-3.5 rounded-2xl ${isPositive ? "bg-brand-emerald/10 text-brand-emerald" : "bg-[#f43f5e]/10 text-[#f43f5e]"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-text-primary">{title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] bg-bg-main text-text-secondary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            #{category}
          </span>
          <span className="text-[10px] text-text-muted font-medium">• {time}</span>
        </div>
      </div>
    </div>
    <div className="text-right">
      <p className={`text-sm font-extrabold ${isPositive ? "text-brand-emerald" : "text-[#f43f5e]"}`}>
        {isPositive ? "+" : "-"}฿{Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-1">{status}</p>
    </div>
  </div>
);

const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-bg-main/50 relative overflow-hidden rounded-2xl ${className}`}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-text-primary/5 to-transparent"
      animate={{ x: ["-100%", "100%"] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    />
  </div>
);


const SectorDistribution = ({ labels, values, limits, types }: any) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Spending',
        data: values,
        backgroundColor: values.map((_v: number, i: number) => {
          if (types && types[i] === 'income') return '#10b981';
          return '#fb7185'; // Always use Rose for Expenses
        }),
        borderRadius: 8,
        barThickness: 20,
      },
      {
        label: 'Budget Limit',
        data: limits,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 8,
        barThickness: 20,
      }
    ]
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { right: 20 } },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          display: true,
          font: { size: 10, weight: 700 },
          color: 'rgba(0, 0, 0, 0.3)',
          callback: (value: any) => `฿${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`
        }
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { size: 11, weight: 900 },
          color: 'rgba(0, 0, 0, 0.8)',
          padding: 20
        }
      },
      yRight: {
        position: 'right' as const,
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { size: 11, weight: 900 },
          color: '#10b981',
          padding: 20,
          callback: (_value: any, index: number) => {
            const val = values[index];
            return val ? `฿${val.toLocaleString()}` : '';
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 10, weight: 700 },
        bodyFont: { size: 12, weight: 900 },
        displayColors: true,
      }
    }
  };

  return (
    <div className="h-[600px] w-full p-4 overflow-y-auto scrollbar-hide">
      <Bar data={data} options={options as any} />
    </div>
  );
};

const CategoryStackFlow = ({ labels, datasets }: any) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 10, weight: 700, family: 'Inter' },
          color: 'rgba(0, 0, 0, 0.4)',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000',
        titleFont: { size: 12, weight: 900 },
        bodyColor: '#666',
        bodyFont: { size: 11, weight: 600 },
        borderColor: 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        filter: (tooltipItem: any) => tooltipItem.raw > 0,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(context.parsed.y);
            }
            return label;
          },
          footer: (tooltipItems: any) => {
            let income = 0;
            let expense = 0;
            tooltipItems.forEach((item: any) => {
              if (item.dataset.categoryType === 'income') income += item.parsed.y;
              else expense += item.parsed.y;
            });
            return [
              `Total Inflow: ฿${income.toLocaleString()}`,
              `Total Outflow: ฿${expense.toLocaleString()}`
            ];
          }
        },
        footerColor: '#475569',
        footerFont: { size: 12, weight: 900 },
        footerSpacing: 8,
        footerMarginTop: 10,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { size: 10, weight: 700 },
          color: 'rgba(0, 0, 0, 0.3)',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12
        }
      },
      y: {
        stacked: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.03)',
          drawBorder: false
        },
        border: { display: false },
        ticks: {
          font: { size: 10, weight: 700 },
          color: 'rgba(0, 0, 0, 0.3)',
          callback: (value: any) => `฿${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`
        }
      }
    }
  };

  return (
    <div className="h-[400px] w-full">
      <Bar data={{ labels, datasets }} options={options as any} />
    </div>
  );
};

const CategoryDoughnut = ({ labels, data, colors }: any) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        hoverBackgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 15,
        borderRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '82%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#000',
        titleFont: { size: 12, weight: 900, family: 'Inter' },
        bodyColor: '#666',
        bodyFont: { size: 11, weight: 600, family: 'Inter' },
        padding: 16,
        boxPadding: 8,
        usePointStyle: true,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ฿${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="relative h-[320px] w-full flex items-center justify-center">
      <Doughnut data={chartData} options={options as any} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Outflow</p>
        <p className="text-3xl font-black text-text-primary tracking-tighter mt-1">
          ฿{data.reduce((a: number, b: number) => a + b, 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const LegendCarousel = ({ labels, values, colors }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(labels.length / itemsPerPage);
  const totalValue = values.reduce((a: number, b: number) => a + b, 0) || 1;

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, offsetWidth } = containerRef.current;
      const newPage = Math.round(scrollLeft / offsetWidth);
      if (newPage !== page) setPage(newPage);
    }
  };

  const scrollToPage = (p: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: p * containerRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center flex-1 w-full relative group">
      {/* Navigation Arrows */}
      {totalPages > 1 && (
        <>
          <button 
            onClick={() => scrollToPage(page - 1)}
            className={`absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-bg-surface border border-border-subtle shadow-architectural transition-all duration-300 ${page === 0 ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 hover:scale-110 active:scale-95'}`}
          >
            <ChevronLeft className="w-4 h-4 text-text-primary" />
          </button>
          <button 
            onClick={() => scrollToPage(page + 1)}
            className={`absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-bg-surface border border-border-subtle shadow-architectural transition-all duration-300 ${page === totalPages - 1 ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 hover:scale-110 active:scale-95'}`}
          >
            <ChevronRight className="w-4 h-4 text-text-primary" />
          </button>
        </>
      )}

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full flex overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory scroll-smooth h-[180px] px-2"
      >
        {Array.from({ length: totalPages }).map((_, pIdx) => (
          <div key={pIdx} className="w-full flex-shrink-0 snap-start grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
            {labels.slice(pIdx * itemsPerPage, (pIdx + 1) * itemsPerPage).map((label: string, index: number) => {
              const actualIdx = pIdx * itemsPerPage + index;
              return (
                <div key={label} className="flex items-center gap-3 p-4 bg-bg-main/30 rounded-2xl border border-border-subtle/50 h-[76px] transition-transform duration-300">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[actualIdx] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-text-primary uppercase tracking-tighter truncate">{label}</p>
                    <p className="text-[11px] font-bold text-text-muted mt-0.5">
                      {((values[actualIdx] / totalValue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
            {/* Pad the last page if needed */}
            {labels.slice(pIdx * itemsPerPage, (pIdx + 1) * itemsPerPage).length < itemsPerPage && 
              Array.from({ length: itemsPerPage - labels.slice(pIdx * itemsPerPage, (pIdx + 1) * itemsPerPage).length }).map((_, i) => (
                <div key={`empty-${i}`} className="opacity-0 pointer-events-none p-4 h-[76px]" />
              ))
            }
          </div>
        ))}
      </div>

    </div>
  );
};

const CategoryManagerModal = ({ isOpen, onClose, categories, onDelete, visibleCategories, onToggleVisibility }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="bg-bg-surface w-full max-w-2xl rounded-[48px] border border-white/20 relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-10 flex justify-between items-center border-b border-border-subtle/50">
              <div>
                <h3 className="text-2xl font-black text-text-primary tracking-tighter">Sector Infrastructure</h3>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Visibility & Structural Control</p>
              </div>
              <button onClick={onClose} className="bg-bg-main p-3 rounded-2xl hover:scale-110 transition-transform">
                <X className="w-5 h-5 text-text-primary" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
              {/* Visibility Ledger */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Visibility Ledger</p>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{categories.length} Total Sectors</p>
                </div>

                <div className="space-y-3">
                  {categories.map((cat: any) => {
                    const isVisible = visibleCategories.includes(cat.id);
                    return (
                      <div key={cat.id} className="flex items-center justify-between p-6 bg-bg-main/30 rounded-[28px] border border-border-subtle/50 group transition-all">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => onToggleVisibility(cat.id)}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isVisible ? 'bg-brand-emerald' : 'bg-text-muted/20'}`}
                          >
                            <motion.div
                              animate={{ x: isVisible ? 26 : 4 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </button>
                          <div>
                            <h4 className={`text-sm font-black transition-colors ${isVisible ? 'text-text-primary' : 'text-text-muted'}`}>{cat.name}</h4>
                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Limit: ฿{cat.monthly_limit.toLocaleString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onDelete(cat.id)}
                          className="p-3 text-text-muted opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main Dashboard Component ---

const Dashboard: React.FC = () => {
  const { transactions, categories, loading, deleteCategory } = useAuth();
  const { openAddModal } = useOutletContext<any>();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);

  // Sync visible categories when categories load
  useEffect(() => {
    if (categories.length > 0 && visibleCategories.length === 0) {
      setVisibleCategories(categories.map(c => c.id));
    }
  }, [categories]);

  const toggleVisibility = (id: string) => {
    setVisibleCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const stats = useMemo(() => {
    let filteredTxns = transactions || [];

    if (filterType === 'month') {
      const [year, month] = selectedMonth.split('-').map(Number);
      filteredTxns = filteredTxns.filter(txn => {
        const d = new Date(txn.transaction_date);
        return d.getMonth() === (month - 1) && d.getFullYear() === year;
      });
    } else if (filterType === 'range') {
      if (startDate) filteredTxns = filteredTxns.filter(txn => txn.transaction_date >= startDate);
      if (endDate) filteredTxns = filteredTxns.filter(txn => txn.transaction_date <= endDate);
    }

    const netBalance = filteredTxns.reduce((acc, txn) =>
      txn.type === 'income' ? acc + Number(txn.amount) : acc - Number(txn.amount), 0);

    const monthlyIncome = filteredTxns
      .filter(txn => txn.type === 'income')
      .reduce((acc, txn) => acc + Number(txn.amount), 0);

    const monthlyExpenses = filteredTxns
      .filter(txn => txn.type === 'expense')
      .reduce((acc, txn) => acc + Number(txn.amount), 0);

    const categorySpending = filteredTxns
      .reduce((acc: any, txn) => {
        const catName = txn.categories?.name || "Other";
        acc[catName] = (acc[catName] || 0) + Number(txn.amount);
        return acc;
      }, {});

    const sparklineLabels = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });

    const sparklineData = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split('T')[0];
      return transactions
        .filter(txn => txn.transaction_date <= dateStr)
        .reduce((acc, txn) => txn.type === 'income' ? acc + Number(txn.amount) : acc - Number(txn.amount), 0);
    });

    const pulseLabels = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleDateString(undefined, { month: 'short' });
    });

    const pulseData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth();
      const y = d.getFullYear();
      return (transactions || [])
        .filter(txn => {
          const td = new Date(txn.transaction_date);
          return td.getMonth() === m && td.getFullYear() === y && txn.type === 'expense';
        })
        .reduce((acc, txn) => acc + Number(txn.amount), 0);
    });

    const allCategories = categories;

    const sectorLabels = allCategories
      .filter(cat => visibleCategories.includes(cat.id))
      .sort((a, b) => {
        // Income first, then by spending volume
        if (a.type !== b.type) return a.type === 'income' ? -1 : 1;
        return (categorySpending[b.name] || 0) - (categorySpending[a.name] || 0);
      })
      .map(cat => cat.name);

    const sectorValues = sectorLabels.map(label => categorySpending[label] || 0);
    const sectorTypes = sectorLabels.map(label => categories.find((c: any) => c.name === label)?.type || 'expense');
    const sectorLimits = sectorLabels.map(label => {
      const cat = categories.find((c: any) => c.name === label);
      return cat?.type === 'income' ? 0 : (cat?.monthly_limit || (monthlyIncome * 0.2));
    });

    // --- Stacked Data Calculation ---
    const getDaysInRange = () => {
      const days = [];
      if (filterType === 'month') {
        const [year, month] = selectedMonth.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        for (let i = 1; i <= lastDay; i++) {
          days.push(`${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
        }
      } else {
        const start = new Date(startDate || new Date().toISOString().split('T')[0]);
        const end = new Date(endDate || new Date().toISOString().split('T')[0]);
        const curr = new Date(start);
        while (curr <= end) {
          days.push(curr.toISOString().split('T')[0]);
          curr.setDate(curr.getDate() + 1);
        }
      }
      return days;
    };

    const timelineDays = getDaysInRange();
    const timelineLabels = timelineDays.map(d => {
      const date = new Date(d);
      return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    });

    const INCOME_COLORS = [
      '#10b981', // Emerald Primary
      '#34d399', // Soft Emerald
      '#6ee7b7', // Mint
      '#059669', // Deep Emerald
      '#a7f3d0'  // Pale Mint
    ];
    const EXPENSE_COLORS = [
      '#fb7185', // Soft Rose
      '#fda4af', // Light Rose
      '#f43f5e', // Vibrant Rose
      '#e11d48', // Deep Rose
      '#fff1f2'  // Blushed White
    ];

    const DOUGHNUT_PALETTE = [
      '#fb7185', // Rose
      '#818cf8', // Indigo
      '#2dd4bf', // Teal
      '#fbbf24', // Amber
      '#a78bfa', // Violet
      '#94a3b8', // Slate
      '#f472b6', // Pink
    ];

    let incomeIdx = 0;
    let expenseIdx = 0;

    const stackedDatasets = sectorLabels.map((catName) => {
      const cat = categories.find((c: any) => c.name === catName);
      const isIncome = cat?.type === 'income';

      const backgroundColor = isIncome
        ? INCOME_COLORS[incomeIdx++ % INCOME_COLORS.length]
        : EXPENSE_COLORS[expenseIdx++ % EXPENSE_COLORS.length];

      return {
        label: catName,
        categoryType: cat?.type || 'expense',
        data: timelineDays.map(day => {
          return filteredTxns
            .filter(txn => txn.transaction_date === day && txn.categories?.name === catName)
            .reduce((sum, txn) => sum + Number(txn.amount), 0);
        }),
        backgroundColor,
        borderRadius: 4,
      };
    });

    const totalFlow = monthlyIncome + monthlyExpenses;
    const incomeRatio = totalFlow > 0 ? (monthlyIncome / totalFlow) * 100 : 50;

    return {
      netBalance, monthlyIncome, monthlyExpenses, categorySpending,
      sparklineData, sparklineLabels, pulseData, pulseLabels,
      sectorLabels, sectorValues, sectorLimits, sectorTypes, incomeRatio,
      timelineLabels, stackedDatasets,
      ...(() => {
        const sorted = allCategories
          .filter(c => c.type === 'expense')
          .sort((a, b) => {
            const valA = categorySpending[a.name] || 0;
            const valB = categorySpending[b.name] || 0;
            if (valB !== valA) return valB - valA;
            return a.name.localeCompare(b.name);
          });
        return {
          doughnutLabels: sorted.map(c => c.name),
          doughnutValues: sorted.map(c => categorySpending[c.name] || 0),
          doughnutColors: sorted.map((_, i) => DOUGHNUT_PALETTE[i % DOUGHNUT_PALETTE.length]),
        };
      })(),
      filteredTxns: [...filteredTxns].sort((a, b) =>
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      )
    };
  }, [transactions, categories, filterType, selectedMonth, startDate, endDate, visibleCategories]);

  const recentTransactions = stats.filteredTxns.slice(0, 10);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-10">
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 pb-20">
      {/* Timeframe Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-1 md:px-0 relative z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-emerald/5 border border-brand-emerald/10 flex items-center justify-center rounded-2xl">
            <CalendarIcon className="w-5 h-5 text-brand-emerald" />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.3em]">Temporal Frame</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Active Ledger Filter</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto bg-bg-surface/50 backdrop-blur-md p-2 rounded-[24px] border border-border-subtle">
          <div className="flex bg-bg-main p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setFilterType('month')}
              className={`flex-1 sm:flex-none px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === 'month' ? "bg-bg-surface text-text-primary" : "text-text-muted"}`}
            >
              Month
            </button>
            <button
              onClick={() => setFilterType('range')}
              className={`flex-1 sm:flex-none px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === 'range' ? "bg-bg-surface text-text-primary" : "text-text-muted"}`}
            >
              Range
            </button>
          </div>
          <div className="flex items-center gap-3">
            {filterType === 'month' ? (
              <MonthPicker value={selectedMonth} onChange={setSelectedMonth} align="right" />
            ) : (
              <div className="flex items-center gap-2">
                <DatePicker value={startDate} onChange={setStartDate} placeholder="Start" />
                <span className="text-text-muted text-xs">—</span>
                <DatePicker value={endDate} onChange={setEndDate} placeholder="End" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-brand-emerald/10 dark:bg-brand-emerald/5 border-2 border-brand-emerald/20 rounded-[32px] md:rounded-[40px] p-6 md:p-10 flex flex-col xl:flex-row gap-8 items-center justify-between relative overflow-hidden">
        <div className="flex-1 w-full text-center xl:text-left z-10">
          <div className="flex items-center justify-center xl:justify-start gap-2 mb-2">
            <p className="text-[11px] font-bold text-brand-emerald uppercase tracking-[0.2em]">Net Balance</p>
            <Lock className="w-2.5 h-2.5 text-brand-emerald" />
          </div>
          <div className="relative inline-block mb-8 group">
            <div className="absolute inset-x-0 -bottom-10 h-32 opacity-40">
              <Line
                data={{
                  labels: stats.sparklineLabels,
                  datasets: [{
                    data: stats.sparklineData,
                    borderColor: '#00875a',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                  }]
                }}
                options={{ responsive: true, maintainAspectRatio: false, scales: { x: { display: false }, y: { display: false } }, plugins: { legend: { display: false } } }}
              />
            </div>
            <div className="flex items-baseline justify-center xl:justify-start gap-3 relative">
              <span className="text-3xl md:text-5xl font-light text-text-primary opacity-30">฿</span>
              <h2 className="text-6xl md:text-8xl font-black text-text-primary tracking-tighter leading-none">
                {stats.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row xl:flex-col gap-6 w-full xl:w-auto">
          <div className="bg-white dark:bg-bg-surface p-8 rounded-[40px] flex-1 xl:w-64 border border-border-subtle">
            <p className="text-[10px] font-black text-brand-emerald uppercase mb-3">Income</p>
            <h4 className="text-3xl font-black text-text-primary">฿{stats.monthlyIncome.toLocaleString()}</h4>
          </div>
          <div className="bg-white dark:bg-bg-surface p-8 rounded-[40px] flex-1 xl:w-64 border border-border-subtle">
            <p className="text-[10px] font-black text-[#f43f5e] uppercase mb-3">Expenses</p>
            <h4 className="text-3xl font-black text-text-primary">฿{stats.monthlyExpenses.toLocaleString()}</h4>
          </div>
        </div>
      </section>

      {/* Consumption Flow (Stacked Graph) */}
      <section>
        <div className="flex items-center gap-3 mb-8 px-2">
          <h3 className="text-2xl font-black text-text-primary tracking-tighter">Consumption Flow</h3>
          <div className="h-px flex-1 bg-border-subtle/50" />
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Aggregate Velocity</p>
        </div>
        <div className="bg-bg-surface rounded-[40px] border border-border-subtle p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Landmark className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-10">
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Temporal Distribution</p>
                <h4 className="text-3xl font-black text-text-primary tracking-tighter mt-1">Daily Sector Volume</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Peak Outflow</p>
                <p className="text-xl font-black text-brand-emerald mt-1">
                  ฿{Math.max(...stats.stackedDatasets.map((ds: any) => Math.max(...ds.data))).toLocaleString()}
                </p>
              </div>
            </div>
            <CategoryStackFlow
              labels={stats.timelineLabels}
              datasets={stats.stackedDatasets}
            />
          </div>
        </div>
      </section>


      {/* Main Content Sections */}
      <div className="space-y-12">
        {/* Distribution & Activity Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Distribution Doughnut */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3 px-2">
              <h3 className="text-2xl font-black text-text-primary tracking-tighter">Sector Split</h3>
              <div className="h-px flex-1 bg-border-subtle/50" />
            </div>
            <div className="bg-bg-surface rounded-[40px] border border-border-subtle p-10 shadow-sm relative overflow-hidden h-[600px] flex flex-col justify-between">
              <CategoryDoughnut 
                labels={stats.doughnutLabels}
                data={stats.doughnutValues}
                colors={stats.doughnutColors}
              />
              <LegendCarousel 
                labels={stats.doughnutLabels}
                data={stats.doughnutValues}
                values={stats.doughnutValues}
                colors={stats.doughnutColors}
              />
            </div>
          </div>

          {/* Right: Recent Activity */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-2xl font-black text-text-primary tracking-tighter">Recent Activity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/transactions', { state: { filterType, selectedMonth, startDate, endDate } })}
                  className="text-[10px] font-bold text-text-muted hover:text-brand-emerald uppercase tracking-[0.2em] transition-colors"
                >
                  View All
                </button>
                <button onClick={openAddModal} className="bg-brand-emerald text-white px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                  <Plus className="w-3.5 h-3.5 inline mr-1.5" /> New Entry
                </button>
              </div>
            </div>
            <div className="bg-bg-surface rounded-[40px] border border-border-subtle p-8 h-[600px] overflow-y-auto scrollbar-hide shadow-sm">
              {recentTransactions.length > 0 ? recentTransactions.map(txn => (
                <TransactionItem
                  key={txn.id}
                  icon={getCategoryIcon(txn.categories?.name || "")}
                  title={txn.categories?.name || "Unclassified"}
                  category={txn.categories?.name || "Misc"}
                  time={new Date(txn.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  amount={txn.amount}
                  isPositive={txn.type === 'income'}
                  status="Verified"
                />
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                  <p className="text-sm font-bold uppercase tracking-widest">No Recent Activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Sector Health (Full Width) */}
        <section>
          <div className="flex items-center gap-3 mb-8 px-2">
            <h3 className="text-2xl font-black text-text-primary tracking-tighter">Sector Health</h3>
            <div className="h-px flex-1 bg-border-subtle/50" />
          </div>

          <div className="bg-bg-surface rounded-[40px] border border-border-subtle overflow-hidden shadow-sm">
            <div className="flex flex-col">
              {/* Top Analytical Bar */}
              <div className="p-10 border-b border-border-subtle/50 bg-bg-main/20 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Sector Intelligence Ledger</p>
                  <p className="text-2xl font-black text-text-primary tracking-tighter mt-1">{stats.sectorLabels.length} Active Financial Sectors</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowCategoryManager(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-bg-surface border border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand-emerald transition-all shadow-sm"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Manage Infrastructure
                  </button>
                </div>
              </div>



              <div className="p-10">
                <div className="min-h-[500px]">
                  <SectorDistribution
                    labels={stats.sectorLabels}
                    values={stats.sectorValues}
                    limits={stats.sectorLimits}
                    types={stats.sectorTypes}
                  />
                </div>

                <div className="mt-12 p-8 bg-bg-main/30 rounded-[32px] border border-border-subtle/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-relaxed max-w-2xl">
                    Financial Symmetry Analysis: Current spending distribution shows dominant focus on <span className="text-brand-emerald">{stats.sectorLabels[0] || 'Unclassified'}</span>.
                    Aim for balanced quadrants to maintain long-term capital stability.
                  </p>
                  <button
                    onClick={() => navigate('/transactions', { state: { filterType, selectedMonth } })}
                    className="whitespace-nowrap px-8 py-3 bg-white dark:bg-bg-surface hover:bg-brand-emerald text-text-primary hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-border-subtle hover:border-brand-emerald transition-all shadow-sm">
                    Reconcile Sectors
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <CategoryManagerModal
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        categories={categories}
        onDelete={deleteCategory}
        visibleCategories={visibleCategories}
        onToggleVisibility={toggleVisibility}
      />
    </div>
  );
};

export default Dashboard;