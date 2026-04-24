import React, { useState } from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Error during deletion:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-bg-surface rounded-[32px] shadow-2xl border border-border-subtle overflow-hidden transition-all animate-in fade-in zoom-in duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          {/* Warning Icon */}
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="text-xl font-extrabold text-text-primary tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-4 bg-bg-main hover:bg-border-subtle/30 text-text-secondary rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Decommission
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Decorative close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
