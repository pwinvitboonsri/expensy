import React, { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Sparkles,
  ArrowDownLeft,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Music,
  Heart,
  Landmark,
  Tag,
  Plus,
  Lock,
  Calendar as CalendarIcon
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useOutletContext } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DatePicker from "../components/DatePicker";
import MonthPicker from "../components/MonthPicker";

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
      <div className="bg-bg-main p-3.5 rounded-2xl">
        <Icon className="w-5 h-5 text-text-primary" />
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
      <p className={`text-sm font-extrabold ${isPositive ? "text-brand-emerald" : "text-text-primary"}`}>
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

const ProgressBar = ({ label, current, total }: any) => {
  const percentage = Math.min((current / total) * 100, 100);
  const isOverBudget = current > total;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end px-1">
        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</label>
          <p className="text-sm font-extrabold text-text-primary mt-0.5">
            ฿{current.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isOverBudget ? "text-red-500" : "text-text-muted"}`}>
            {isOverBudget ? "Over Budget" : "Remaining"}
          </span>
          <p className={`text-xs font-bold mt-0.5 ${isOverBudget ? "text-red-500" : "text-brand-emerald"}`}>
            {isOverBudget ? `+฿${(current - total).toLocaleString()}` : `฿${(total - current).toLocaleString()}`}
          </p>
        </div>
      </div>
      <div className="h-1.5 bg-bg-main rounded-full overflow-hidden relative">
        {/* Budget Track */}
        <div className="absolute inset-0 bg-text-primary/5 rounded-full" />
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full rounded-full transition-colors duration-500 relative z-10 ${isOverBudget ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" : "bg-brand-emerald"
            }`}
        />
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { transactions, categories, loading } = useAuth();
  const { openAddModal } = useOutletContext<any>();
  const navigate = useNavigate();

  // Timeframe States
  const [filterType, setFilterType] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const stats = useMemo(() => {
    let filteredTxns = transactions;

    if (filterType === 'month') {
      const [year, month] = selectedMonth.split('-').map(Number);
      filteredTxns = transactions.filter(txn => {
        const d = new Date(txn.transaction_date);
        return d.getMonth() === (month - 1) && d.getFullYear() === year;
      });
    } else if (filterType === 'range') {
      if (startDate) {
        filteredTxns = filteredTxns.filter(txn => txn.transaction_date >= startDate);
      }
      if (endDate) {
        filteredTxns = filteredTxns.filter(txn => txn.transaction_date <= endDate);
      }
    }

    const netBalance = filteredTxns.reduce((acc, txn) =>
      txn.type === 'income' ? acc + Number(txn.amount) : acc - Number(txn.amount), 0);

    const monthlyIncome = filteredTxns
      .filter(txn => txn.type === 'income')
      .reduce((acc, txn) => acc + Number(txn.amount), 0);

    const monthlyExpenses = filteredTxns
      .filter(txn => txn.type === 'expense')
      .reduce((acc, txn) => acc + Number(txn.amount), 0);

    // Spending by category for budget health
    const categorySpending = filteredTxns
      .filter(txn => txn.type === 'expense')
      .reduce((acc: any, txn) => {
        const catName = txn.categories?.name || "Other";
        acc[catName] = (acc[catName] || 0) + Number(txn.amount);
        return acc;
      }, {});

    // Sparkline data (last 7 days - always all-time trajectory)
    const sparklineData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];

      const balanceOnDate = transactions
        .filter(txn => txn.transaction_date <= dateStr)
        .reduce((acc, txn) => txn.type === 'income' ? acc + Number(txn.amount) : acc - Number(txn.amount), 0);

      return { value: balanceOnDate };
    });

    return {
      netBalance,
      monthlyIncome,
      monthlyExpenses,
      categorySpending,
      sparklineData,
      filteredTxns: [...filteredTxns].sort((a, b) =>
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      )
    };
  }, [transactions, filterType, selectedMonth, startDate, endDate]);

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
      {/* Timeframe Selector - Premium Redesign */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-1 md:px-0 relative z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-emerald/5 border border-brand-emerald/10 flex items-center justify-center rounded-2xl shadow-sm">
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

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto bg-bg-surface/50 backdrop-blur-md p-2 rounded-[24px] border border-border-subtle shadow-sm">
          <div className="flex bg-bg-main p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setFilterType('month')}
              className={`flex-1 sm:flex-none px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === 'month' ? "bg-bg-surface text-text-primary shadow-md shadow-black/5" : "text-text-muted hover:text-text-secondary"}`}
            >
              Month
            </button>
            <button
              onClick={() => setFilterType('range')}
              className={`flex-1 sm:flex-none px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === 'range' ? "bg-bg-surface text-text-primary shadow-md shadow-black/5" : "text-text-muted hover:text-text-secondary"}`}
            >
              Range
            </button>
          </div>

          <div className="h-8 w-[1px] bg-border-subtle hidden sm:block" />

          <div className="flex items-center gap-3 w-full sm:w-auto min-w-[200px]">
            {filterType === 'month' ? (
              <div className="flex-1">
                <MonthPicker
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  align="right"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <DatePicker value={startDate} onChange={setStartDate} placeholder="Start" side="bottom" align="right" />
                <span className="text-text-muted text-xs font-bold">—</span>
                <DatePicker value={endDate} onChange={setEndDate} placeholder="End" side="bottom" align="right" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section: Balance & Main Stats */}
      <section className="bg-brand-emerald/10 dark:bg-brand-emerald/5 border-2 border-brand-emerald/20 rounded-[32px] md:rounded-[40px] p-6 md:p-10 flex flex-col xl:flex-row gap-8 xl:gap-10 items-center justify-between shadow-2xl shadow-emerald-500/5 relative z-10 overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="flex-1 w-full text-center xl:text-left z-10">
          <header className="mb-6">
            <div className="flex items-center justify-center xl:justify-start gap-2 mb-2">
              <p className="text-[11px] font-bold text-brand-emerald uppercase tracking-[0.2em]">Net Balance</p>
              <div className="bg-brand-emerald/20 p-1 rounded-md">
                <Lock className="w-2.5 h-2.5 text-brand-emerald" />
              </div>
            </div>
            <p className="text-[10px] text-text-secondary font-medium flex items-center justify-center xl:justify-start gap-1.5 uppercase tracking-wide">
              Live Ledger Update — Encrypted Vault
            </p>
          </header>

          <div className="relative inline-block mb-8">
            {/* Sparkline Background */}
            <div className="absolute inset-x-0 -bottom-6 h-20 opacity-30 pointer-events-none filter blur-[1px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--brand-emerald)"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={true}
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-baseline justify-center xl:justify-start gap-3 relative">
              <span className="text-3xl md:text-5xl font-light text-text-primary opacity-30 select-none">฿</span>
              <h2 className="text-6xl md:text-8xl font-black text-text-primary tracking-tighter leading-none">
                {stats.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-4 md:gap-6 mt-4">
            <div className="flex items-center gap-1.5 text-brand-emerald/60">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-[9px]">Financial Intelligence Active</span>
            </div>
          </div>
        </div>

        {/* Mini Cards - Reference Matched UI */}
        <div className="flex flex-col sm:flex-row xl:flex-col gap-6 w-full xl:w-auto">
          <div className="flex items-center gap-3 group">
            <div className="bg-white dark:bg-bg-surface p-8 rounded-[40px] flex-1 xl:w-64 shadow-xl shadow-emerald-900/5 flex flex-col justify-center border border-white/50 dark:border-border-subtle/50 transition-all hover:scale-[1.02]">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">{filterType === 'month' ? "Income (MTD)" : "Total Income"}</p>
              <h4 className="text-3xl md:text-4xl font-black text-text-primary tracking-tighter leading-none">
                ฿{stats.monthlyIncome.toLocaleString()}
              </h4>
            </div>
            <div className="bg-brand-emerald/10 p-2.5 rounded-2xl flex items-center justify-center border border-brand-emerald/20 shadow-sm shadow-emerald-500/10">
              <ArrowDownLeft className="w-5 h-5 text-brand-emerald" />
            </div>
          </div>

          <div className="flex items-center gap-3 group">
            <div className="bg-white dark:bg-bg-surface p-8 rounded-[40px] flex-1 xl:w-64 shadow-xl shadow-emerald-900/5 flex flex-col justify-center border border-white/50 dark:border-border-subtle/50 transition-all hover:scale-[1.02]">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">{filterType === 'month' ? "Expenses (MTD)" : "Total Expenses"}</p>
              <h4 className="text-3xl md:text-4xl font-black text-text-primary tracking-tighter leading-none">
                ฿{stats.monthlyExpenses.toLocaleString()}
              </h4>
            </div>
            <div className="bg-red-500/10 p-2.5 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-sm shadow-red-500/10">
              <ArrowUpRight className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Recent Transactions (Left) */}
        <div className="lg:col-span-8 flex flex-col order-2 lg:order-1">
          <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
            <h3 className="text-xl font-extrabold text-text-primary tracking-tight">Recent Activity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={openAddModal}
                className="hidden sm:flex items-center gap-2 bg-brand-emerald text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-brand-emerald-dark transition-all active:scale-95"
              >
                <Plus className="w-3 h-3" />
                New Entry
                <span className="ml-1 opacity-50 px-1 border border-white/30 rounded">N</span>
              </button>
              <button
                onClick={() => navigate('/transactions', { state: { filterType, selectedMonth, startDate, endDate } })}
                className="text-[10px] font-bold text-text-muted hover:text-brand-emerald uppercase tracking-[0.2em] transition-colors"
              >
                View All
              </button>
            </div>
          </div>
          <div className="bg-bg-surface rounded-[32px] border border-border-subtle shadow-sm h-[600px] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
              {recentTransactions.length > 0 ? recentTransactions.map((txn) => (
                <TransactionItem
                  key={txn.id}
                  icon={getCategoryIcon(txn.categories?.name || "")}
                  title={txn.categories?.name || "Unclassified"}
                  category={txn.categories?.name || "Misc"}
                  time={new Date(txn.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  amount={txn.amount}
                  status="Verified"
                  isPositive={txn.type === 'income'}
                />
              )) : (
                <div className="py-12 text-center">
                  <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No Recent Activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Budget Health (Right) */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
            <h3 className="text-xl font-extrabold text-text-primary">Sector Health</h3>
          </div>
          <div className="bg-bg-surface rounded-[32px] border border-border-subtle shadow-sm h-[600px] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide">
              {Object.keys(stats.categorySpending).length > 0 ? Object.entries(stats.categorySpending).slice(0, 8).map(([name, amount]: any) => {
                const categoryObj = categories.find(c => c.name === name);
                const limit = categoryObj?.monthly_limit || (stats.monthlyIncome * 0.2); // Fallback to 20% of income if no limit set
                return (
                  <ProgressBar
                    key={name}
                    label={name}
                    current={amount}
                    total={limit}
                  />
                );
              }) : (
                <div className="py-12 text-center">
                  <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Awaiting Data</p>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 pt-0 mt-auto">
              <button className="w-full bg-bg-main hover:bg-bg-main/80 text-text-primary py-3.5 rounded-xl font-bold text-xs transition-colors">
                Detailed Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
