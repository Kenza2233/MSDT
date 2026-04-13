"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <LoadingSpinner label="Confirming authentication..." />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="dashboard-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
