import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ArrowUpDown,
  Calendar,
  Check,
  Edit3,
  Trash2
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useOutletContext, useLocation } from "react-router-dom";
import DatePicker from "../components/DatePicker";

const Transactions: React.FC = () => {
  const { transactions, categories, loading, deleteTransaction } = useAuth();
  const { openEditModal } = useOutletContext<any>();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [activeType, setActiveType] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  // Close filters on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
        setIsCatDropdownOpen(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Apply filters from navigation state
  useEffect(() => {
    if (location.state) {
      const { filterType, selectedMonth, startDate: sDate, endDate: eDate } = location.state;
      if (filterType === 'month') {
        const [year, month] = selectedMonth.split('-').map(Number);
        // Start of month
        const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
        
        // End of month
        const end = new Date(year, month, 0);
        const endStr = `${year}-${String(month).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
        
        setStartDate(startStr);
        setEndDate(endStr);
      } else {
        setStartDate(sDate || "");
        setEndDate(eDate || "");
      }
      // If we have any filters, show the panel so user sees what's applied
      if (filterType || sDate || eDate) {
        setShowFilters(true);
      }
    }
  }, [location.state]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this architectural entry? This action cannot be reversed.")) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        alert("Failed to delete transaction");
      }
    }
  };

  const filteredTransactions = transactions
    .filter(txn => {
      const matchesSearch = txn.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.categories?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = activeType === "all" || txn.type === activeType;
      const matchesCategory = activeCategory === "all" || txn.category_id === activeCategory;

      const txnDate = new Date(txn.transaction_date).getTime();
      const matchesStartDate = !startDate || txnDate >= new Date(startDate).getTime();
      const matchesEndDate = !endDate || txnDate <= new Date(endDate).getTime();

      return matchesSearch && matchesType && matchesCategory && matchesStartDate && matchesEndDate;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
      if (sortBy === "oldest") return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      if (sortBy === "amount_high") return b.amount - a.amount;
      if (sortBy === "amount_low") return a.amount - b.amount;
      return 0;
    });

  const activeFiltersCount = (activeType !== "all" ? 1 : 0) +
    (activeCategory !== "all" ? 1 : 0) +
    (startDate || endDate ? 1 : 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1 md:px-0">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-xs font-bold text-text-primary focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${showFilters || activeFiltersCount > 0
                  ? "bg-brand-emerald/5 border-brand-emerald text-brand-emerald"
                  : "bg-bg-surface border-border-subtle text-text-primary hover:bg-bg-main"
                }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 bg-brand-emerald text-white text-[8px] rounded-full ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Filter Popover */}
            {showFilters && (
              <div className="fixed inset-x-4 top-[20%] sm:absolute sm:inset-auto sm:top-full sm:mt-3 sm:right-0 sm:w-80 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl z-[60] animate-in fade-in zoom-in duration-300">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-main/20 rounded-t-2xl">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Architecture Filter</span>
                  <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-bg-main rounded-md transition-colors">
                    <X className="w-3 h-3 text-text-muted" />
                  </button>
                </div>

                <div className="p-5 space-y-6">
                  {/* Type Filter */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Transaction Type</label>
                    <div className="flex bg-bg-main p-1 rounded-xl">
                      {["all", "expense", "income"].map(type => (
                        <button
                          key={type}
                          onClick={() => setActiveType(type)}
                          className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all ${activeType === type ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Primary Sector</label>
                    <div className="relative" ref={catDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                        className="w-full bg-bg-main border border-border-subtle rounded-xl py-2.5 px-3 text-xs font-bold text-text-primary flex items-center justify-between hover:bg-bg-main/80 transition-all outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">
                            {activeCategory === "all" ? "All Sectors" : categories.find(c => c.id === activeCategory)?.name}
                          </span>
                        </div>
                        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-300 ${isCatDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isCatDropdownOpen && (
                        <div className="absolute top-full mt-2 left-0 w-full bg-bg-surface border border-border-subtle rounded-xl shadow-xl z-[70] overflow-hidden py-1.5 animate-in fade-in zoom-in duration-200">
                          <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                            <button
                              onClick={() => {
                                setActiveCategory("all");
                                setIsCatDropdownOpen(false);
                              }}
                              className={`w-full flex items-center px-3 py-2 text-xs font-bold transition-colors ${activeCategory === "all" ? "text-brand-emerald bg-brand-emerald/5" : "text-text-secondary hover:text-text-primary hover:bg-bg-main"
                                }`}
                            >
                              All Sectors
                            </button>
                            {categories.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  setActiveCategory(cat.id);
                                  setIsCatDropdownOpen(false);
                                }}
                                className={`w-full flex items-center px-3 py-2 text-xs font-bold transition-colors ${activeCategory === cat.id ? "text-brand-emerald bg-brand-emerald/5" : "text-text-secondary hover:text-text-primary hover:bg-bg-main"
                                  }`}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Temporal Frame (Range)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-bold text-text-muted uppercase ml-1">Start</span>
                        <DatePicker
                          value={startDate}
                          onChange={setStartDate}
                          placeholder="Select date"
                          side="right"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-bold text-text-muted uppercase ml-1">End</span>
                        <DatePicker
                          value={endDate}
                          onChange={setEndDate}
                          placeholder="Select date"
                          side="right"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Chronology</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "newest", label: "Newest First", icon: Calendar },
                        { id: "amount_high", label: "Highest Amount", icon: ArrowUpDown },
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSortBy(item.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-[10px] font-bold transition-all ${sortBy === item.id ? "bg-brand-emerald/10 text-brand-emerald" : "bg-bg-main/50 text-text-secondary hover:bg-bg-main"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="w-3 h-3" />
                            {item.label}
                          </div>
                          {sortBy === item.id && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-bg-main/20 border-t border-border-subtle">
                  <button
                    onClick={() => {
                      setActiveType("all");
                      setActiveCategory("all");
                      setSortBy("newest");
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="w-full py-2 text-[10px] font-bold text-text-muted hover:text-red-500 uppercase tracking-widest transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-all uppercase tracking-wider ml-auto sm:ml-0">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-bg-surface rounded-[24px] md:rounded-[32px] border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-main/30">
                <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] w-[20%]">Timeline / Reference</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Classification & Details</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Sector</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] text-right">Amount (USD)</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] text-right w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-8 h-8 border-4 border-brand-emerald/30 border-t-brand-emerald rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? filteredTransactions.map((txn) => (
                <tr key={txn.id} className="group hover:bg-bg-main/50 transition-all border-b border-border-subtle last:border-0 relative">
                  <td className="px-6 md:px-8 py-4 md:py-6">
                    <p className="text-sm font-bold text-text-primary">
                      {new Date(txn.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">{txn.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-bg-main flex-shrink-0 flex items-center justify-center overflow-hidden border border-border-subtle">
                        <div className="w-6 h-6 bg-brand-emerald/10 flex items-center justify-center rounded-lg">
                          <span className="text-[10px] font-bold text-brand-emerald">{(txn.categories?.name || "U").charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">{txn.categories?.name || "Unclassified"}</h4>
                        <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
                          <p className="text-[10px] font-bold text-text-muted uppercase line-clamp-1">{txn.description || "No description"}</p>
                          <div className="hidden sm:flex items-center gap-2">
                            {txn.tags?.map(tag => (
                              <span key={tag} className="text-[10px] bg-bg-main text-text-secondary px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6">
                    <span className={`text-[10px] px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase transition-all ${txn.type === "income"
                      ? "bg-brand-emerald text-white shadow-lg shadow-emerald-500/10"
                      : "bg-bg-main text-text-secondary"
                      }`}>
                      {txn.categories?.name || "General"}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                    <p className={`text-sm font-extrabold tracking-tight ${txn.type === "income" ? "text-brand-emerald" : "text-red-500"}`}>
                      {txn.type === "income" ? "+" : "-"}฿{Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(txn)}
                        className="p-2 hover:bg-bg-main rounded-lg text-text-muted hover:text-brand-emerald transition-colors"
                        title="Edit Entry"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(txn.id)}
                        className="p-2 hover:bg-bg-main rounded-lg text-text-muted hover:text-red-500 transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm text-text-secondary font-medium">No transactions found matching your architecture.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 md:px-8 py-6 bg-bg-main/30 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-medium text-text-secondary order-2 md:order-1">
            Viewing <span className="font-bold text-text-primary">1-{filteredTransactions.length}</span> of <span className="font-bold text-text-primary">{transactions.length}</span> entries
          </p>

          <div className="flex items-center gap-1.5 order-1 md:order-2">
            <button className="p-2 text-text-muted hover:text-text-primary transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <button className="min-w-[32px] h-8 flex items-center justify-center rounded-lg text-[11px] font-bold bg-brand-emerald text-white shadow-lg shadow-emerald-500/10">
                1
              </button>
            </div>
            <button className="p-2 text-text-secondary hover:text-text-primary transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
