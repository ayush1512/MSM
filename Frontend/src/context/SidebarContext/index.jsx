import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const SidebarContext = createContext();

// Provider component
export const SidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(window.innerWidth >= 1200);
  
  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= 1200);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const openSidebar = () => setOpen(true);
  const closeSidebar = () => setOpen(false);
  const toggleSidebar = () => setOpen(prev => !prev);
  
  return (
    <SidebarContext.Provider value={{ open, openSidebar, closeSidebar, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook for using sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};