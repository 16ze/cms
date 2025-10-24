"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import AdminAssistant from "@/components/admin/admin-assistant";
import NotificationBell from "@/components/admin/NotificationBell";
import adminContentData from "@/config/admin-content.json";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useSidebarMode } from "@/hooks/use-sidebar-mode";
import { useFrontendContent } from "@/hooks/use-frontend-content";
import {
  Menu,
  X,
  BarChart3,
  Calendar,
  Users,
  FileText,
  Palette,
  User,
  Settings,
  LogOut,
  Shield,
  ArrowLeft,
} from "lucide-react";
import "@/styles/admin-buttons.css";
import "@/styles/admin-mobile-responsive.css";
import "@/styles/admin-visual-improvements.css";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const layoutContent = adminContentData.layout;
  const navContent = adminContentData.navigation.main;
  const rolesContent = adminContentData.permissions.roles;
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  // Récupérer l'utilisateur depuis la session
  const { user: sessionUser, loading: sessionLoading } = useAdminSession();

  // Hook pour gérer le mode de la sidebar
  const { mode: sidebarMode } = useSidebarMode();
  
  console.log("🔍 [Layout] Sidebar mode:", sidebarMode);
  console.log("🔍 [Layout] Pathname:", pathname);

  // Charger le contenu frontend si on est en mode éditeur
  const { content: frontendContent, reload: reloadContent } =
    useFrontendContent({
      pageSlug: "accueil",
      autoSync: false, // ✅ Désactivé pour éviter le refresh permanent
    });
  
  console.log("🔍 [Layout] Frontend content:", frontendContent);

  // Fonction pour sauvegarder le contenu édité
  const handleEditorSave = async (section: string, data: any) => {
    console.log("💾 [Layout] Sauvegarde demandée:", { section, data });
    try {
      const response = await fetch("/api/admin/frontend-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSlug: "accueil",
          sectionSlug: section,
          dataType: "text",
          content: data,
        }),
      });

      console.log("📡 [Layout] Réponse API:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ [Layout] Erreur API:", errorData);
        throw new Error(`Erreur ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log("✅ [Layout] Sauvegarde réussie:", result);

      // Recharger le contenu après sauvegarde
      await reloadContent();

      // Déclencher un événement pour recharger l'iframe
      window.dispatchEvent(new CustomEvent("content-updated"));
    } catch (error) {
      console.error("❌ [Layout] Erreur sauvegarde:", error);
      throw error;
    }
  };

  // Fonction pour revenir au menu principal
  const handleEditorBack = () => {
    router.push("/admin/dashboard");
  };

  // Vérifier si on est en mode impersonation
  useEffect(() => {
    const checkImpersonation = () => {
      // Vérifier si le cookie "impersonating" existe
      const cookies = document.cookie.split(";");
      const impersonatingCookie = cookies.find((c) =>
        c.trim().startsWith("impersonating=")
      );
      setIsImpersonating(impersonatingCookie?.includes("true") || false);
    };

    checkImpersonation();
    // Vérifier périodiquement au cas où
    const interval = setInterval(checkImpersonation, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fonction pour quitter le mode impersonation
  const handleExitImpersonation = async () => {
    try {
      const confirmation = confirm(
        "Voulez-vous retourner au dashboard Super Admin ?"
      );

      if (!confirmation) return;

      const response = await fetch("/api/super-admin/impersonate", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Rediriger vers le dashboard Super Admin
        router.push("/super-admin/dashboard");
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur sortie impersonation:", error);
      alert("Erreur lors de la sortie du mode impersonation");
    }
  };

  // Page de login - pas besoin de sidebar
  // Forcer le mode clair pour la page de login aussi
  if (pathname === "/login") {
    return <div className="light">{children}</div>;
  }

  // Afficher un loader pendant la vérification de la session
  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur après le chargement, le hook redirige vers login
  if (!sessionUser) {
    return null;
  }

  // Normaliser le rôle (SUPER_ADMIN -> super_admin)
  const normalizedRole = sessionUser.role.toLowerCase().replace(/-/g, "_");

  const userInfo: UserInfo = {
    id: sessionUser.id,
    name: sessionUser.name,
    email: sessionUser.email,
    role: normalizedRole,
  };

  return (
    <div className="flex h-screen bg-slate-50 light">
      {/* Sidebar - Masquée sur mobile, visible sur desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <AdminSidebar
          activePage={pathname}
          onLogout={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
          }}
          user={userInfo}
          sidebarMode={sidebarMode === "default" ? "navigation" : sidebarMode}
          editorContent={frontendContent}
          onEditorSave={handleEditorSave}
          onEditorBack={handleEditorBack}
        
        {/* Debug logs */}
        {console.log("🔍 [Layout] AdminSidebar props:", {
          sidebarMode: sidebarMode === "default" ? "navigation" : sidebarMode,
          hasEditorContent: !!frontendContent,
          hasEditorSave: !!handleEditorSave,
          hasEditorBack: !!handleEditorBack
        })}
        />
      </div>

      {/* Contenu principal - Pleine largeur sur mobile */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* Bannière d'impersonation */}
        {isImpersonating && (
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-4 py-3 shadow-lg relative overflow-hidden">
            {/* Animation background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

            <div className="relative flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold">Mode Super Admin</span>
                </div>
                <div className="hidden sm:block w-px h-5 bg-white/30"></div>
                <span className="hidden sm:inline text-sm opacity-90">
                  Vous gérez l'espace de ce client
                </span>
              </div>
              <button
                onClick={handleExitImpersonation}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg border border-white/30 transition-all font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour Super Admin</span>
                <span className="sm:hidden">Retour</span>
              </button>
            </div>
          </div>
        )}

        {/* Header - Design épuré sans bordures marquées */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="px-4 lg:px-8 py-4 lg:py-5">
            <div className="flex items-center justify-between">
              {/* Logo et titre sur mobile */}
              <div className="lg:hidden flex items-center space-x-3">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-slate-600" />
                  ) : (
                    <Menu className="w-5 h-5 text-slate-600" />
                  )}
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="text-lg font-bold text-slate-900">Admin</span>
              </div>

              {/* Informations utilisateur - Desktop */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-600">
                    {layoutContent.header.connectedAs}{" "}
                    <span className="font-semibold text-slate-900">
                      {userInfo?.role === "super_admin"
                        ? rolesContent.superAdmin
                        : rolesContent.admin}
                    </span>
                  </span>
                </div>
                {userInfo && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {userInfo.email}
                  </span>
                )}
              </div>

              {/* Actions - Mobile et Desktop */}
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <NotificationBell />

                {/* Bouton de déconnexion */}
                <button
                  onClick={async () => {
                    try {
                      // Récupérer le type d'utilisateur avant de se déconnecter
                      const meResponse = await fetch("/api/auth/me");
                      const meData = await meResponse.json();
                      const userType = meData.success ? meData.user.type : null;

                      // Déconnexion
                      await fetch("/api/auth/logout", { method: "POST" });

                      // Redirection selon le type
                      if (userType === "SUPER_ADMIN") {
                        router.push("/super-admin/login");
                      } else {
                        router.push("/login");
                      }
                    } catch (error) {
                      console.error("Erreur déconnexion:", error);
                      router.push("/login");
                    }
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors duration-200"
                >
                  <span className="hidden lg:inline">
                    {layoutContent.header.logout}
                  </span>
                  <LogOut className="lg:hidden w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Menu mobile - Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overlay-enter"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl sidebar-bounce-enter"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">
                        {layoutContent.sidebar.logo.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {layoutContent.sidebar.logo}{" "}
                        {layoutContent.sidebar.logoSuffix}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {layoutContent.sidebar.adminPanel}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Navigation mobile */}
                <nav className="space-y-2">
                  <a
                    href="/admin/dashboard"
                    className={`sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      pathname === "/admin/dashboard"
                        ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>{navContent.dashboard}</span>
                  </a>
                  <a
                    href="/admin/reservations"
                    className={`sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      pathname === "/admin/reservations"
                        ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>{navContent.reservations}</span>
                  </a>
                  <a
                    href="/admin/clients"
                    className={`sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      pathname === "/admin/clients"
                        ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="w-5 h-5" />
                    <span>{navContent.clients}</span>
                  </a>
                  <a
                    href="/admin/content-advanced"
                    className={`sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      pathname === "/admin/content-advanced"
                        ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FileText className="w-5 h-5" />
                    <span>{navContent.content}</span>
                  </a>
                  <a
                    href="/admin/site"
                    className={`sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      pathname === "/admin/site"
                        ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Palette className="w-5 h-5" />
                    <span>{navContent.site}</span>
                  </a>
                  <a
                    href="/admin/users"
                    className={`sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      pathname === "/admin/users"
                        ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>{navContent.users}</span>
                  </a>
                  <a
                    href="/admin/settings"
                    className={`sidebar-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      pathname === "/admin/settings"
                        ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    <span>{navContent.settings}</span>
                  </a>
                </nav>

                {/* Profil utilisateur mobile */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {userInfo?.name?.charAt(0) || "A"}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {userInfo?.name || "Admin"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {userInfo?.email || "admin@example.com"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userInfo?.role === "super_admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {userInfo?.role === "super_admin"
                        ? rolesContent.superAdmin
                        : rolesContent.admin}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenu de la page */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 bg-gradient-to-br from-slate-50 to-white">
          {children}
        </main>
      </div>

      {/* Assistant Admin */}
      <AdminAssistant />
    </div>
  );
}
