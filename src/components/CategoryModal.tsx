import React, { useState, useEffect } from "react";
import { X, Plus, Tag, ArrowUpCircle, ArrowDownCircle, Save } from "lucide-react";
import { supabase } from "../supabase";

interface Category {
  id: string;
  name: string;
  type: "expense" | "income";
  is_default: boolean;
  monthly_limit: number;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  category?: Category | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  category
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [monthlyLimit, setMonthlyLimit] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      setMonthlyLimit(category.monthly_limit.toString());
    } else {
      setName("");
      setType("expense");
      setMonthlyLimit("0");
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (category) {
        // Update existing
        const { error } = await supabase
          .from("categories")
          .update({
            name: name.trim(),
            type: type,
            monthly_limit: parseFloat(monthlyLimit) || 0
          })
          .eq("id", category.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("categories")
          .insert([
            {
              user_id: userId,
              name: name.trim(),
              type: type,
              is_default: false,
              monthly_limit: parseFloat(monthlyLimit) || 0
            }
          ]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-bg-surface rounded-[32px] shadow-2xl border border-border-subtle overflow-hidden transition-all animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border-subtle flex justify-between items-center bg-bg-main/20">
          <div>
            <h3 className="text-xl font-extrabold text-text-primary tracking-tight">
              {category ? "Modify Architectural Sector" : "New Architectural Category"}
            </h3>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">
              {category ? "Update Ledger Config" : "Define Ledger Sector"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Name Input */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Category Name</label>
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-emerald transition-colors" />
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Creative Studio, Cloud Infrastructure"
                className="w-full bg-bg-main border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all placeholder:text-text-muted text-text-primary shadow-inner"
                required
              />
            </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Ledger Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all group ${type === "expense"
                    ? "border-brand-emerald bg-brand-emerald/5 text-brand-emerald"
                    : "border-transparent bg-bg-main text-text-secondary hover:bg-border-subtle/30"
                  }`}
              >
                <ArrowDownCircle className={`w-5 h-5 ${type === "expense" ? "text-brand-emerald" : "text-text-muted group-hover:text-text-secondary"}`} />
                <span className="text-sm font-bold uppercase tracking-wider">Expense</span>
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all group ${type === "income"
                    ? "border-brand-emerald bg-brand-emerald/5 text-brand-emerald"
                    : "border-transparent bg-bg-main text-text-secondary hover:bg-border-subtle/30"
                  }`}
              >
                <ArrowUpCircle className={`w-5 h-5 ${type === "income" ? "text-brand-emerald" : "text-text-muted group-hover:text-text-secondary"}`} />
                <span className="text-sm font-bold uppercase tracking-wider">Income</span>
              </button>
            </div>
          </div>

          {/* Monthly Limit */}
          {type === "expense" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Monthly Spending Limit</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-muted group-focus-within:text-brand-emerald">$</div>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-bg-main border-none rounded-2xl py-4 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all text-text-primary shadow-inner"
                />
              </div>
              <p className="text-[10px] text-text-muted ml-1 italic">Optional: Set a budget threshold for this sector.</p>
            </div>
          )}

          {/* Summary Info */}
          <div className="p-4 bg-bg-main/50 rounded-2xl border border-border-subtle/50">
            <p className="text-[11px] text-text-secondary leading-relaxed text-center">
              This category will be {category ? "updated" : "initialized"} as a <span className="text-text-primary font-bold">{type.toUpperCase()}</span> sector in your financial architecture.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-bg-main hover:bg-border-subtle/30 text-text-secondary rounded-2xl text-sm font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-4 bg-brand-emerald hover:bg-brand-emerald-dark text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {category ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {category ? "Commit Changes" : "Initialize Category"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
