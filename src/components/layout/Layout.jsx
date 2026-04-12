import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ContactForm from '../contacts/ContactForm';
import ToastContainer from '../Toast';
import { useToastState } from '../useToastState';
import { useContacts } from '../../hooks/useContacts';
import { LayoutContext } from './layoutContext';
import './Layout.css';
import '../Toast.css';
import '../Skeleton.css';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const { create } = useContacts();
  const { toasts, addToast, removeToast } = useToastState();

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const openAddLead = useCallback(() => setShowAddLead(true), []);
  const closeAddLead = useCallback(() => setShowAddLead(false), []);

  const handleCreateLead = useCallback(async (data) => {
    const record = await create(data);
    addToast('Lead created successfully');
    return record;
  }, [create, addToast]);

  return (
    <LayoutContext.Provider value={{ openAddLead, addToast }}>
      <div className="layout">
        <Sidebar open={sidebarOpen} onClose={closeSidebar} />
        <div className="layout-main">
          <TopBar onMenuToggle={toggleSidebar} onAddLead={openAddLead} />
          <main className="layout-content">
            <Outlet />
          </main>
        </div>
      </div>

      {showAddLead && (
        <ContactForm onSubmit={handleCreateLead} onClose={closeAddLead} />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </LayoutContext.Provider>
  );
}
