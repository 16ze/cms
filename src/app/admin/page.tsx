"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-neutral-200 border-t-blue-600 mx-auto"></div>
        <p className="text-neutral-600 dark:text-neutral-400">
          Redirection vers le tableau de bord...
        </p>
      </div>
    </div>
  );
}
