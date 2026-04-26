import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import TransactionModal from "./TransactionModal";
import { Plus } from "lucide-react";

const Layout: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openAddModal();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  return (
    <div className="flex w-full min-h-screen bg-bg-main text-text-primary font-sans transition-colors duration-300">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onAddTransaction={openAddModal}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <Outlet context={{ openEditModal, openAddModal }} />
        </main>
      </div>

      {/* Floating Action Button for Mobile/Tablet */}
      <button 
        onClick={openAddModal}
        className="fixed bottom-8 right-8 lg:hidden w-16 h-16 bg-brand-emerald text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:bg-brand-emerald-dark transition-all z-[45] active:scale-95 animate-in slide-in-from-bottom-10 duration-500"
        title="Quick Add Transaction"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default Layout;
