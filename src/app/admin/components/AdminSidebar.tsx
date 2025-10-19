"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  BarChart3,
  CalendarRange,
  Users,
  Settings,
  LogOut,
  Layers,
  FileText,
  Menu,
  X,
  Cog,
  Globe2,
  UserPlus,
  Search,
  TrendingUp,
  Zap,
} from "lucide-react";
import { hasPageAccess, UserRole } from "@/lib/permissions";
import adminContent from "@/config/admin-content.json";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { useNotifications } from "@/hooks/use-notifications";
import AccordionMenu from "@/components/admin/AccordionMenu";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AdminSidebarProps {
  activePage: string;
  onLogout: () => void;
  user: AdminUser | null;
}

export default function AdminSidebar({
  activePage,
  onLogout,
  user,
}: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Récupérer les permissions de l'utilisateur connecté
  const { hasPageAccess: hasPermission, loading: permissionsLoading } =
    useAdminPermissions();

  // Récupérer les notifications pour les badges
  const { notifications, unreadCount } = useNotifications();

  // Calculer les compteurs de notifications par catégorie
  const getNotificationCount = (category: string) => {
    return notifications.filter((n) => n.category === category && !n.read)
      .length;
  };

  const reservationCount = getNotificationCount("RESERVATION");
  const clientCount = getNotificationCount("CLIENT");
  const seoCount = getNotificationCount("SEO");
  const systemCount = getNotificationCount("SYSTEM");
  const contentCount = getNotificationCount("CONTENT");

  // Obtenir le rôle de l'utilisateur actuel et le normaliser
  // La base de données retourne "SUPER_ADMIN" mais le système utilise "super_admin"
  const normalizeRole = (role: string): UserRole => {
    const normalized = role.toLowerCase().replace(/-/g, "_");
    return normalized as UserRole;
  };

  const userRole = user?.role ? normalizeRole(user.role) : "admin";

  // Composant Badge pour les notifications
  const NotificationBadge = ({ count }: { count: number }) => {
    if (count === 0) return null;
    return (
      <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg ring-2 ring-white">
        {count > 99 ? "99+" : count}
      </span>
    );
  };

  // Import des labels de navigation depuis admin-content.json
  const nav = adminContent.navigation.main;
  const sidebarContent = adminContent.layout.sidebar;
  const rolesContent = adminContent.permissions.roles;

  // Définition des éléments de navigation avec leurs permissions
  const navigationItems = [
    {
      id: "dashboard",
      href: "/admin/dashboard",
      label: nav.dashboard,
      icon: BarChart3,
      requiredRoles: ["admin", "super_admin"] as UserRole[],
    },
    {
      id: "reservations",
      href: "/admin/reservations",
      label: nav.reservations,
      icon: CalendarRange,
      requiredRoles: ["admin", "super_admin"] as UserRole[],
    },
    {
      id: "clients",
      href: "/admin/clients",
      label: nav.clients,
      icon: UserPlus,
      requiredRoles: ["admin", "super_admin"] as UserRole[],
    },
    {
      id: "content-advanced",
      href: "/admin/content/advanced",
      label: nav.content,
      icon: Cog,
      requiredRoles: ["super_admin"] as UserRole[],
    },
    {
      id: "site",
      href: "/admin/site",
      label: nav.site,
      icon: Globe2,
      requiredRoles: ["super_admin"] as UserRole[],
    },
    {
      id: "users",
      href: "/admin/users",
      label: nav.users,
      icon: Users,
      requiredRoles: ["super_admin"] as UserRole[],
    },
    {
      id: "settings",
      href: "/admin/settings",
      label: nav.settings,
      icon: Settings,
      requiredRoles: ["super_admin"] as UserRole[],
    },
  ];

  // Filtrer les éléments accessibles selon les permissions réelles
  const accessibleItems = permissionsLoading
    ? []
    : navigationItems.filter((item) => hasPermission(item.id));

  // Détecter si la taille de l'écran est mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setIsMobileMenuOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fermer le menu mobile quand on clique sur un lien
  const handleNavLinkClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Ajouter une classe au body quand le menu est ouvert pour empêcher le défilement
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Bouton hamburger pour mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`fixed top-3 left-3 p-2.5 rounded-md bg-white/95 dark:bg-neutral-900/95 shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-[9999] lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-0 pointer-events-none"
            : "opacity-100 flex"
        } items-center justify-center`}
        aria-label="Menu"
      >
        <Menu size={20} className="text-neutral-800 dark:text-white" />
      </button>

      {/* Overlay pour fermer le menu sur mobile */}
      {isMobileMenuOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-[9990] lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Effet de flou sur le contenu principal quand le menu est ouvert */}
      {isMobileMenuOpen && isMobile && (
        <div
          className="fixed inset-0 z-[9980] backdrop-blur-md opacity-100 lg:hidden transition-opacity duration-300 ease-in-out"
          aria-hidden="true"
        ></div>
      )}

      <aside
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-[9995] w-[85%] max-w-[320px] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transform transition-transform duration-300 ease-in-out ${
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "w-64 h-full bg-white/95 backdrop-blur-sm shadow-sm"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo et bouton fermer pour mobile */}
          <div className="p-6 flex justify-between items-center">
            <Link href="/admin" className="inline-block">
              <h1 className="text-xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                  {sidebarContent.logo}
                </span>
                <span className="text-sm font-medium ml-1.5 text-slate-600">
                  {sidebarContent.logoSuffix}
                </span>
                <span className="text-blue-600">.</span>
              </h1>
            </Link>
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <X size={22} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="px-6 py-2 flex-1 overflow-y-auto">
            <div className="space-y-2">
              {accessibleItems.map((item) => {
                // Si c'est l'élément "users", on insère le menu SEO avant
                if (item.id === "users") {
                  const hasSEOPermissions =
                    hasPermission("keywords") || hasPermission("settings");

                  return (
                    <div key="seo-menu-container">
                      {/* Menu accordéon SEO */}
                      {hasSEOPermissions && (
                        <div className="mb-2">
                          <AccordionMenu
                            title="SEO"
                            icon={TrendingUp}
                            items={[
                              {
                                id: "seo-keywords",
                                label: "Analyse des mots-clés",
                                href: "/admin/seo/keywords",
                                icon: Search,
                              },
                              {
                                id: "seo-analysis",
                                label: "Analyse Technique",
                                href: "/admin/seo/analysis",
                                icon: BarChart3,
                              },
                              {
                                id: "seo-performance",
                                label: "Performance",
                                href: "/admin/seo/performance",
                                icon: Zap,
                              },
                              {
                                id: "seo-settings",
                                label: "Paramètres SEO",
                                href: "/admin/seo/settings",
                                icon: Settings,
                              },
                            ]}
                            isActive={
                              activePage.startsWith("seo") ||
                              activePage === "keywords"
                            }
                            defaultOpen={
                              activePage.startsWith("seo") ||
                              activePage === "keywords"
                            }
                            className="mb-2"
                          />
                        </div>
                      )}

                      {/* Élément users normal */}
                      <div className="mb-2">
                        <Link
                          href={item.href}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                            activePage === item.id
                              ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                          onClick={handleNavLinkClick}
                        >
                          <div className="flex items-center">
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                          </div>
                          <NotificationBadge count={systemCount} />
                        </Link>
                      </div>
                    </div>
                  );
                }

                // Pour les autres éléments, rendu normal avec badges
                const IconComponent = item.icon;

                // Déterminer le compteur de notifications pour cet élément
                let notificationCount = 0;
                switch (item.id) {
                  case "reservations":
                    notificationCount = reservationCount;
                    break;
                  case "clients":
                    notificationCount = clientCount;
                    break;
                  case "content-advanced":
                    notificationCount = contentCount;
                    break;
                  case "site":
                    notificationCount = seoCount;
                    break;
                  default:
                    notificationCount = 0;
                }

                return (
                  <div key={item.id} className="mb-2">
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                        activePage === item.id
                          ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                      onClick={handleNavLinkClick}
                    >
                      <div className="flex items-center">
                        <IconComponent className="w-5 h-5 mr-3" />
                        {item.label}
                      </div>
                      <NotificationBadge count={notificationCount} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Profile and logout */}
          <div className="p-6 space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-4 shadow-sm">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate text-sm text-slate-900">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <div className="flex items-center mt-2">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      userRole === "super_admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {userRole === "super_admin"
                      ? rolesContent.superAdmin
                      : rolesContent.admin}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-start px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-medium transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              {adminContent.layout.header.logout}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
