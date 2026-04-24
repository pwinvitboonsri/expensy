import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Car,
  Home,
  Activity,
  Sparkles,
  ShoppingBag,
  Zap,
  Heart,
  Globe,
  Tag,
  Pencil,
  Trash2,
  X,
  Check
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase";
import CategoryModal from "../components/CategoryModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

// Define the Category interface locally or import it if exported from elsewhere
interface Category {
  id: string;
  name: string;
  type: "expense" | "income";
  is_default: boolean;
  monthly_limit: number;
  created_at: string;
}

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('food') || n.includes('dining') || n.includes('meal')) return UtensilsCrossed;
  if (n.includes('transport') || n.includes('car') || n.includes('fuel')) return Car;
  if (n.includes('house') || n.includes('rent') || n.includes('utility')) return Home;
  if (n.includes('health') || n.includes('medical')) return Activity;
  if (n.includes('shop')) return ShoppingBag;
  if (n.includes('bill') || n.includes('electric')) return Zap;
  if (n.includes('gift') || n.includes('love')) return Heart;
  if (n.includes('travel')) return Globe;
  return Tag;
};

const getCategoryColor = (index: number) => {
  const colors = [
    { bg: "bg-red-500", iconBg: "bg-red-500/10", iconColor: "text-red-500" },
    { bg: "bg-brand-emerald", iconBg: "bg-brand-emerald/10", iconColor: "text-brand-emerald" },
    { bg: "bg-blue-500", iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    { bg: "bg-purple-500", iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
    { bg: "bg-orange-500", iconBg: "bg-orange-500/10", iconColor: "text-orange-500" },
  ];
  return colors[index % colors.length];
};

const Budgets: React.FC = () => {
  const { categories, user, refreshCategories } = useAuth();
  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense');
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Advanced Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "default" | "custom">("all");
  const [budgetStatusFilter, setBudgetStatusFilter] = useState<"all" | "hasLimit" | "noLimit">("all");
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filters on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = categories.filter(cat => {
    const matchesType = cat.type === selectedType;
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = visibilityFilter === "all" || 
                              (visibilityFilter === "default" && cat.is_default) || 
                              (visibilityFilter === "custom" && !cat.is_default);
    const matchesBudgetStatus = budgetStatusFilter === "all" || 
                                 (budgetStatusFilter === "hasLimit" && cat.monthly_limit > 0) || 
                                 (budgetStatusFilter === "noLimit" && (cat.monthly_limit === 0 || !cat.monthly_limit));
    
    return matchesType && matchesSearch && matchesVisibility && matchesBudgetStatus;
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id);
      
      if (error) throw error;
      refreshCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category");
      throw err;
    }
  };

  const activeFiltersCount = (visibilityFilter !== "all" ? 1 : 0) + (budgetStatusFilter !== "all" ? 1 : 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-10">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 px-1 md:px-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">Category Ledger</h1>
          <p className="text-text-secondary mt-2 text-base md:text-lg">Define and organize your financial architecture</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-bg-surface border border-border-subtle hover:bg-bg-main rounded-xl text-sm font-bold text-text-primary transition-all shadow-sm">
            <Upload className="w-4 h-4" />
            Export Config
          </button>
          <button
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-emerald hover:bg-brand-emerald-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Category
          </button>
        </div>
      </div>

      {/* Main Ledger Section */}
      <div className="bg-bg-surface rounded-[32px] md:rounded-[40px] shadow-sm border border-border-subtle transition-colors duration-300">
        {/* Filters & Actions Header */}
        <div className="p-6 md:p-8 border-b border-border-subtle flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="bg-bg-main p-1 rounded-xl flex w-full xl:w-auto">
            <button
              onClick={() => setSelectedType('expense')}
              className={`flex-1 xl:flex-none xl:px-8 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${selectedType === 'expense' ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
                }`}
            >
              Expense
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`flex-1 xl:flex-none xl:px-8 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${selectedType === 'income' ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
                }`}
            >
              Income
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto xl:max-w-md">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-emerald transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full bg-bg-main border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all text-text-primary placeholder:text-text-muted"
              />
            </div>
            
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full sm:w-auto p-3.5 rounded-xl transition-all flex items-center justify-center border ${
                  showFilters || activeFiltersCount > 0 
                    ? "bg-brand-emerald/5 border-brand-emerald text-brand-emerald" 
                    : "bg-bg-main border-transparent hover:bg-bg-main/80 text-text-secondary"
                }`}
              >
                <Filter className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="flex items-center justify-center w-4 h-4 bg-brand-emerald text-white text-[8px] rounded-full ml-2">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Filter Popover */}
              {showFilters && (
                <div className="absolute top-full mt-3 right-0 w-72 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl z-[60] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-main/20 rounded-t-2xl">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Ledger Filter</span>
                    <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-bg-main rounded-md transition-colors">
                      <X className="w-3 h-3 text-text-muted" />
                    </button>
                  </div>
                  
                  <div className="p-5 space-y-6">
                    {/* Visibility Filter */}
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Sector Source</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: "all", label: "All Sources" },
                          { id: "default", label: "System Defaults" },
                          { id: "custom", label: "User Custom" },
                        ].map(item => (
                          <button
                            key={item.id}
                            onClick={() => setVisibilityFilter(item.id as any)}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-[10px] font-bold transition-all ${
                              visibilityFilter === item.id ? "bg-brand-emerald/10 text-brand-emerald" : "bg-bg-main/50 text-text-secondary hover:bg-bg-main"
                            }`}
                          >
                            {item.label}
                            {visibilityFilter === item.id && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget Status Filter */}
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Budget Configuration</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: "all", label: "All Configurations" },
                          { id: "hasLimit", label: "With Spending Limit" },
                          { id: "noLimit", label: "No Limit Set" },
                        ].map(item => (
                          <button
                            key={item.id}
                            onClick={() => setBudgetStatusFilter(item.id as any)}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-[10px] font-bold transition-all ${
                              budgetStatusFilter === item.id ? "bg-brand-emerald/10 text-brand-emerald" : "bg-bg-main/50 text-text-secondary hover:bg-bg-main"
                            }`}
                          >
                            {item.label}
                            {budgetStatusFilter === item.id && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-bg-main/20 border-t border-border-subtle">
                    <button 
                      onClick={() => {
                        setVisibilityFilter("all");
                        setBudgetStatusFilter("all");
                      }}
                      className="w-full py-2 text-[10px] font-bold text-text-muted hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      Reset Ledger Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto rounded-b-[32px] md:rounded-b-[40px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-main/20">
                <th className="px-8 md:px-10 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] w-[35%]">Category Name</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Type</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Monthly Budget</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Created At</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? filteredCategories.map((item, index) => {
                const Icon = getCategoryIcon(item.name);
                const color = getCategoryColor(index);
                return (
                  <tr key={item.id} className="group hover:bg-bg-main/50 transition-all border-b border-border-subtle last:border-0 relative">
                    <td className="px-8 md:px-10 py-6 relative">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${color.bg}`} />
                      <div className="flex items-center gap-4">
                        <div className={`${color.iconBg} p-3.5 rounded-2xl`}>
                          <Icon className={`w-5 h-5 ${color.iconColor}`} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-text-primary">{item.name}</h4>
                          <p className="text-[10px] text-text-muted font-medium mt-1 uppercase tracking-tight">
                            {item.is_default ? "System Default" : "User Custom"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-6">
                      <span className="text-[9px] font-extrabold px-3 py-1.5 rounded-lg bg-bg-main text-text-secondary tracking-[0.1em] uppercase">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-6">
                      <div className="flex items-center gap-2">
                        {item.monthly_limit > 0 ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                            <span className="text-[10px] font-bold text-text-primary">฿{item.monthly_limit.toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-text-muted italic">No Limit</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-6">
                      <span className="text-xs font-bold text-text-secondary">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2.5 text-text-muted hover:text-brand-emerald hover:bg-brand-emerald/10 rounded-xl transition-all"
                          title="Edit Category"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm text-text-secondary font-medium">No architectural categories found in this sector.</p>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setIsModalOpen(true);
                      }}
                      className="mt-4 text-brand-emerald text-xs font-bold uppercase tracking-wider hover:underline"
                    >
                      Initialize first category
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-bg-main/20 border-t border-border-subtle">
          <p className="text-[11px] font-bold text-text-secondary order-2 md:order-1">
            Showing <span className="text-text-primary">{filteredCategories.length} of {categories.length}</span> architectural categories
          </p>
          <div className="flex items-center gap-2 order-1 md:order-2">
            <button className="p-2 text-text-muted hover:text-text-primary transition-all rounded-lg hover:bg-bg-surface/50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-bold bg-brand-emerald text-white shadow-lg shadow-emerald-500/10 transition-all">
                1
              </button>
            </div>
            <button className="p-2 text-text-secondary hover:text-text-primary transition-all rounded-lg hover:bg-bg-surface">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Subsection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="lg:col-span-2 bg-bg-surface rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-sm border border-border-subtle flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center transition-colors duration-300">
          <div className="flex-1 w-full space-y-8 md:space-y-10">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand-emerald" />
              <h3 className="text-xl font-extrabold text-text-primary">Dynamic Ledger Insights</h3>
            </div>

            <div className="space-y-8 md:space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-text-primary">Category Health</span>
                  <span className="text-xs font-extrabold text-brand-emerald">Optimized</span>
                </div>
                <div className="h-1.5 bg-bg-main rounded-full overflow-hidden">
                  <div className="h-full bg-brand-emerald rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full space-y-6">
            <p className="text-[11px] md:text-xs text-text-secondary leading-relaxed">
              Your architectural ledger is now dynamic. Categories are fetched directly from your Supabase instance.
            </p>
          </div>
        </div>

        <div className="bg-brand-emerald rounded-[32px] md:rounded-[40px] p-8 md:p-10 flex flex-col justify-between shadow-2xl shadow-emerald-500/20 relative overflow-hidden group min-h-[300px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>

          <div className="relative z-10">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em] mb-4">Database Link</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">Live Synchronization</h3>
          </div>

          <div className="relative z-10 mt-6">
            <p className="text-[11px] text-white/70 leading-relaxed font-medium">
              Your categories are synchronized across all devices in real-time.
            </p>
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={refreshCategories}
        userId={user?.id || ""}
        category={editingCategory}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Decommission Category"
        message={`Are you sure you want to decommission "${categoryToDelete?.name}"? This action will permanently remove this sector from your financial architecture.`}
      />
    </div>
  );
};

export default Budgets;
