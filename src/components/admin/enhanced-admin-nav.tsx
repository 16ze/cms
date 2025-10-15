"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FileText, 
  Settings, 
  Users, 
  Calendar, 
  BarChart3, 
  Globe,
  Palette,
  Database,
  Layers,
  Cog,
  Globe2
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Gestion Universelle", href: "/admin/content/universal", icon: Globe, badge: "Nouveau" },
  { name: "Gestion de Contenu", href: "/admin/content/advanced", icon: Cog, badge: "Recommandé" },
  { name: "Header & Footer", href: "/admin/site", icon: Globe2, badge: "Nouveau" },
  { name: "Réservations", href: "/admin/reservations", icon: Calendar },
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
  { name: "Statistiques", href: "/admin/stats", icon: BarChart3 },
  { name: "Design & Apparence", href: "/admin/design", icon: Palette },
  { name: "Configuration", href: "/admin/settings", icon: Settings },
];

export default function EnhancedAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center">
          <Layers className="h-8 w-8 text-blue-600" />
          <h1 className="ml-3 text-xl font-bold text-gray-900">Admin Kairo</h1>
        </div>
      </div>
      
      <div className="px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Section d'aide rapide */}
      <div className="mt-8 px-3">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Aide rapide</h3>
          <p className="text-xs text-blue-700 mb-3">
            Utilisez le <strong>Gestionnaire Universel</strong> pour modifier toutes les pages de votre site.
          </p>
          <Link
            href="/admin/content/universal"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
          >
            <Globe className="w-3 h-3 mr-1" />
            Accéder
          </Link>
        </div>
      </div>
    </nav>
  );
}
