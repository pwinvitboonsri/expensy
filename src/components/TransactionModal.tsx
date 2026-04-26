import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, Tag, Plus, UtensilsCrossed, Car, ShoppingBag, Music, Heart, Landmark, Check, ChevronDown } from "lucide-react";
import { supabase } from "../supabase";
import { useAuth } from "../contexts/AuthContext";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any; // Optional transaction for editing
}

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

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction }) => {
  const { user, categories, refreshTransactions } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpense, setIsExpense] = useState(true);
  const [amount, setAmount] = useState("0.00");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tags, setTags] = useState(["Dinner", "Date Night"]);
  const [newTag, setNewTag] = useState("");
  const [description, setDescription] = useState("");
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Populate form if editing
  useEffect(() => {
    if (transaction) {
      setIsExpense(transaction.type === "expense");
      setAmount(transaction.amount.toString());
      setCategoryId(transaction.category_id);
      setDate(transaction.transaction_date);
      setTags(transaction.tags || []);
      setDescription(transaction.description || "");
    } else {
      // Reset form for new transaction
      setIsExpense(true);
      setAmount("0.00");
      setCategoryId("");
      setDate(new Date().toISOString().split("T")[0]);
      setTags(["Dinner", "Date Night"]);
      setDescription("");
    }
  }, [transaction, isOpen]);

  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === (isExpense ? 'expense' : 'income'));
  const selectedCategory = categories.find(c => c.id === categoryId) || (filteredCategories.length > 0 ? filteredCategories[0] : null);

  // Initialize category for new transactions
  useEffect(() => {
    if (!transaction && filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, categoryId, transaction]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!user || !categoryId) return;
    setIsSubmitting(true);

    try {
      if (transaction) {
        // Update existing
        const { error } = await supabase
          .from("transactions")
          .update({
            amount: parseFloat(amount),
            type: isExpense ? "expense" : "income",
            category_id: categoryId,
            tags: tags,
            description: description,
            transaction_date: date,
          })
          .eq("id", transaction.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("transactions")
          .insert([
            {
              user_id: user.id,
              amount: parseFloat(amount),
              type: isExpense ? "expense" : "income",
              category_id: categoryId,
              tags: tags,
              description: description,
              transaction_date: date,
            }
          ]);
        if (error) throw error;
      }
      
      await refreshTransactions();
      onClose();
      
      // Reset form
      setAmount("0.00");
      setDescription("");
      setTags(["Dinner", "Date Night"]);
    } catch (err) {
      console.error("Error creating transaction:", err);
      alert("Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectedIcon = selectedCategory ? getCategoryIcon(selectedCategory.name) : Tag;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[500px] bg-bg-surface rounded-t-[32px] sm:rounded-[32px] shadow-2xl shadow-black/20 overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 fade-in duration-300 max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-border-subtle">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-border-subtle flex items-center justify-between shrink-0">
          <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-full transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em]">
            {transaction ? "Edit Transaction" : "New Transaction"}
          </span>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
          {/* Toggle & Amount Section */}
          <div className="space-y-6">
            <div className="bg-bg-main p-1 rounded-xl flex">
              <button
                onClick={() => {
                  setIsExpense(true);
                  setCategoryId(""); // Reset to force re-evaluation of type
                }}
                className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${isExpense ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted"
                  }`}
              >
                Expense
              </button>
              <button
                onClick={() => {
                  setIsExpense(false);
                  setCategoryId(""); // Reset to force re-evaluation of type
                }}
                className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${!isExpense ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted"
                  }`}
              >
                Income
              </button>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-3 md:gap-4 text-text-primary">
                <span className="text-3xl md:text-4xl font-light opacity-30">฿</span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-5xl md:text-6xl font-extrabold tracking-tight bg-transparent border-none focus:ring-0 w-auto min-w-[100px] text-center"
                />
              </div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-4">
                Architectural Ledger Entry
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Category Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-3">
                Primary Category
              </label>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full bg-bg-main border-2 rounded-xl py-4 px-4 text-sm font-bold text-text-primary flex items-center justify-between transition-all outline-none ${
                  isDropdownOpen ? "border-brand-emerald/20 ring-4 ring-brand-emerald/5 bg-bg-surface" : "border-transparent hover:bg-bg-main/80"
                }`}
              >
                <div className="flex items-center gap-4">
                  <SelectedIcon className="w-5 h-5 text-brand-emerald shrink-0" />
                  <span>{selectedCategory?.name || "Select Category"}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-500 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Custom Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 py-2">
                  <div className="max-h-[280px] overflow-y-auto scrollbar-hide px-2">
                    {filteredCategories.length > 0 ? filteredCategories.map((cat) => {
                      const Icon = getCategoryIcon(cat.name);
                      const isSelected = cat.id === categoryId;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategoryId(cat.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all mb-1 last:mb-0 ${
                            isSelected 
                              ? "bg-brand-emerald/10 text-brand-emerald" 
                              : "text-text-secondary hover:text-text-primary hover:bg-bg-main"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isSelected ? "text-brand-emerald" : "text-text-muted opacity-70"}`} />
                            <span>{cat.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-brand-emerald animate-in zoom-in duration-300" />}
                        </button>
                      );
                    }) : (
                      <div className="px-5 py-8 text-xs font-bold text-text-muted uppercase tracking-wider text-center">
                        No {isExpense ? 'expense' : 'income'} sectors
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-3">
                Transaction Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-bg-main border-none rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-text-primary focus:ring-2 focus:ring-brand-emerald/10 outline-none"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-2">
                Contextual Tags
              </label>
              <div className="flex flex-wrap gap-2 bg-bg-main p-3 rounded-xl min-h-[56px] focus-within:ring-2 focus-within:ring-brand-emerald/10 transition-all">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 bg-brand-emerald/10 text-brand-emerald px-3 py-1.5 rounded-lg text-[11px] font-bold">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? "Add tags..." : ""}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium min-w-[80px] text-text-primary placeholder:text-text-muted"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-3">
                Ledger Notes
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Architecture of the transaction..."
                  className="w-full bg-bg-main border-none rounded-2xl py-4 pt-4 px-4 h-24 md:h-32 text-sm font-medium text-text-primary focus:ring-2 focus:ring-brand-emerald/10 outline-none resize-none placeholder:text-text-muted"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Button - Fixed at bottom */}
        <div className="p-6 sm:p-8 border-t border-border-subtle relative bg-bg-surface shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white py-4 md:py-5 rounded-[20px] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition-all font-bold text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              transaction ? (
                <>
                  <Check className="w-5 h-5" />
                  Update Entry
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add {selectedCategory?.name || "Entry"}
                </>
              )
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
