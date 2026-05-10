"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/lib/stores/useBuilderStore";
import { BuilderWorkspace } from "@/components/builder/BuilderWorkspace";
import { BuilderSidebar } from "@/components/builder/BuilderSidebar";

interface BuilderClientProps {
  initialData: any;
}

export function BuilderClient({ initialData }: BuilderClientProps) {
  const initialize = useBuilderStore((state) => state.initialize);

  useEffect(() => {
    if (initialData) {
      initialize(initialData);
    }
  }, [initialData, initialize]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Workspace for Drag and Drop */}
      <BuilderWorkspace />
      
      {/* Sticky Right Sidebar */}
      <div className="relative w-full">
        <BuilderSidebar />
      </div>
    </div>
  );
}
