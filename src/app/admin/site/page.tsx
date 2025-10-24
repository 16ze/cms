"use client";

import { useState, useEffect } from "react";
import LivePreview from "@/components/admin/LivePreview";
import { useFrontendContent } from "@/hooks/use-frontend-content";
import { useRouter } from "next/navigation";

export default function SitePage() {
  const router = useRouter();
  const { content: frontendContent, loading: contentLoading } =
    useFrontendContent({
      pageSlug: "accueil",
      autoSync: false, // ✅ Désactivé pour éviter le refresh permanent
    });

  const handleSaveContent = async (section: string, data: any) => {
    try {
      await fetch("/api/admin/frontend-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSlug: "accueil",
          sectionSlug: section,
          dataType: "text",
          content: data,
        }),
      });
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      throw error;
    }
  };

  const handleBack = () => {
    router.push("/admin/dashboard");
  };

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-gray-50">
      <LivePreview url="/beaute" />
    </div>
  );
}
