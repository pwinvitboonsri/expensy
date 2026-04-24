import React, { useMemo } from "react";
import { 
  ArrowUpRight,
  Sparkles,
  ArrowDownLeft,
  Target,
  MoreHorizontal,
  Info,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Music,
  Heart,
  Landmark,
  Tag
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

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

const ProgressBar = ({ label, current, total, colorClass }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <label className="text-xs font-bold text-text-primary">{label}</label>
      <div className="text-right">
        <span className={`text-xs font-bold ${colorClass}`}>฿{current.toLocaleString()}</span>
        <span className="text-[10px] text-text-muted font-medium"> / ฿{total.toLocaleString()}</span>
      </div>
    </div>
    <div className="h-2 bg-bg-main rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${colorClass.replace("text-", "bg-")}`} 
        style={{ width: `${Math.min((current / total) * 100, 100)}%` }}
      ></div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { transactions, categories, loading } = useAuth();

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const netBalance = transactions.reduce((acc, txn) => 
      txn.type === 'income' ? acc + Number(txn.amount) : acc - Number(txn.amount), 0);

    const monthlyIncome = transactions
      .filter(txn => {
        const d = new Date(txn.transaction_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && txn.type === 'income';
      })
      .reduce((acc, txn) => acc + Number(txn.amount), 0);

    const monthlyExpenses = transactions
      .filter(txn => {
        const d = new Date(txn.transaction_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && txn.type === 'expense';
      })
      .reduce((acc, txn) => acc + Number(txn.amount), 0);

    // Spending by category for budget health
    const categorySpending = transactions
      .filter(txn => {
        const d = new Date(txn.transaction_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && txn.type === 'expense';
      })
      .reduce((acc: any, txn) => {
        const catName = txn.categories?.name || "Other";
        acc[catName] = (acc[catName] || 0) + Number(txn.amount);
        return acc;
      }, {});

    return { netBalance, monthlyIncome, monthlyExpenses, categorySpending };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-brand-emerald/20 border-t-brand-emerald rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-10">
      {/* Hero Section: Balance & Main Stats */}
      <section className="bg-brand-emerald/10 dark:bg-brand-emerald/5 border-2 border-brand-emerald/20 rounded-[32px] md:rounded-[40px] p-6 md:p-10 flex flex-col xl:flex-row gap-8 xl:gap-10 items-center justify-between shadow-2xl shadow-emerald-500/5 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex-1 w-full text-center xl:text-left">
          <header className="mb-6">
            <p className="text-[11px] font-bold text-brand-emerald uppercase tracking-[0.2em] mb-2">Net Balance</p>
            <p className="text-[10px] text-text-secondary font-medium flex items-center justify-center xl:justify-start gap-1.5 uppercase tracking-wide">
              Live Ledger Update — Total Equity
            </p>
          </header>
          
          <div className="flex items-baseline justify-center xl:justify-start gap-2 mb-6">
            <span className="text-2xl md:text-4xl font-light text-text-primary">฿</span>
            <h2 className="text-5xl md:text-7xl font-extrabold text-text-primary tracking-tight">
              {stats.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-4 md:gap-6">
            <div className="bg-brand-emerald/10 px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-emerald uppercase tracking-wider">This Month:</span>
              <span className="text-sm font-extrabold text-brand-emerald">
                ฿{(stats.monthlyIncome - stats.monthlyExpenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <Info className="w-3 h-3 text-brand-emerald/50 ml-1" />
            </div>
            <div className="flex items-center gap-1.5 text-brand-emerald">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold">Dynamic Financial Intelligence</span>
            </div>
          </div>
        </div>

        {/* Mini Cards */}
        <div className="flex flex-wrap justify-center gap-4 w-full xl:w-auto">
          <div className="bg-bg-surface p-6 rounded-3xl w-full sm:w-44 shadow-lg shadow-black/5 flex flex-col justify-between h-36">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Income (MTD)</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-extrabold text-text-primary">฿{stats.monthlyIncome.toLocaleString()}</span>
              <div className="bg-brand-emerald/10 p-1 rounded-md">
                <ArrowDownLeft className="w-4 h-4 text-brand-emerald" />
              </div>
            </div>
          </div>
          <div className="bg-bg-surface p-6 rounded-3xl w-full sm:w-44 shadow-lg shadow-black/5 flex flex-col justify-between h-36">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Expenses (MTD)</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-extrabold text-text-primary">฿{stats.monthlyExpenses.toLocaleString()}</span>
              <div className="bg-red-500/10 p-1 rounded-md">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Recent Transactions (Left) */}
        <div className="lg:col-span-8 flex flex-col order-2 lg:order-1">
          <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
            <h3 className="text-xl font-extrabold text-text-primary">Recent Activity</h3>
            <button className="text-xs font-bold text-brand-emerald hover:underline uppercase tracking-wider">View All</button>
          </div>
          <div className="bg-bg-surface rounded-[32px] p-6 md:p-8 border border-border-subtle shadow-sm flex-1">
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

        {/* Budget Health (Right) */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
            <h3 className="text-xl font-extrabold text-text-primary">Sector Health</h3>
            <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-wider cursor-pointer">
              This Month <MoreHorizontal className="w-4 h-4 ml-1" />
            </div>
          </div>
          <div className="bg-bg-surface rounded-[32px] p-6 md:p-8 border border-border-subtle shadow-sm space-y-8">
            {Object.keys(stats.categorySpending).length > 0 ? Object.entries(stats.categorySpending).slice(0, 5).map(([name, amount]: any) => {
              const categoryObj = categories.find(c => c.name === name);
              const limit = categoryObj?.monthly_limit || (stats.monthlyIncome * 0.2); // Fallback to 20% of income if no limit set
              return (
                <ProgressBar 
                  key={name} 
                  label={name} 
                  current={amount} 
                  total={limit} 
                  colorClass={amount > limit ? "text-red-500" : "text-brand-emerald"} 
                />
              );
            }) : (
              <div className="py-12 text-center">
                <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Awaiting Data</p>
              </div>
            )}
            
            <button className="w-full bg-bg-main hover:bg-bg-main/80 text-text-primary py-3.5 rounded-xl font-bold text-xs mt-4 transition-colors">
              Detailed Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Spending Grid */}
      <div>
        <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
          <h3 className="text-xl font-extrabold text-text-primary">Top Categories</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(stats.categorySpending).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).map(([name, amount]: any, i) => {
            const Icon = getCategoryIcon(name);
            return (
              <div key={i} className="bg-bg-surface p-6 md:p-8 rounded-[32px] border border-border-subtle shadow-sm group hover:border-brand-emerald transition-all cursor-pointer flex flex-col h-full">
                <Icon className="w-5 h-5 text-brand-emerald mb-6" />
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">{name}</p>
                <p className="text-2xl font-extrabold text-text-primary">฿{amount.toLocaleString()}</p>
                <div className="mt-auto pt-4">
                  <p className="text-[10px] text-text-secondary font-medium">Monthly Burn</p>
                </div>
              </div>
            );
          })}

          {/* Savings Goal Card */}
          <div className="bg-bg-surface rounded-[32px] p-6 md:p-8 border border-border-subtle shadow-sm flex flex-col h-full relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-[0.2em]">Asset Growth</h4>
              <Target className="w-5 h-5 text-brand-emerald" />
            </div>
            <div className="mt-auto">
              <p className="text-xs font-bold text-text-primary">Operational Reserve</p>
              <div className="flex justify-between items-end mt-4">
                <div className="h-1 flex-1 bg-bg-main rounded-full overflow-hidden mr-4 self-center">
                  <div className="h-full bg-brand-emerald rounded-full shadow-[0_0_10px_rgba(0,135,90,0.3)]" style={{ width: "100%" }}></div>
                </div>
                <span className="text-sm font-extrabold text-brand-emerald">100%</span>
              </div>
              <p className="text-[10px] text-text-secondary font-medium mt-4 italic">Healthy Cash Flow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
