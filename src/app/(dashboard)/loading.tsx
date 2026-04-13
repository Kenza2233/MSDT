"use client";

import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function DashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <LoadingSpinner label="Loading page content..." />
    </div>
  );
}
