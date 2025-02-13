'use client' // <-- Buni qo‘shing!

import { createContext, useContext, useState } from "react";

// 1. Context yaratish
const SidebarContext = createContext(null);

// 2. Context Provider
export function SidebarProvider({ children }) {
  const [activePage, setActivePage] = useState("allPost");

  return (
    <SidebarContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </SidebarContext.Provider>
  );
}

// 3. Context Hook
export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}
