import { DynamicNavigation } from "./dynamic-navigation";
import { DynamicFooter } from "./dynamic-footer";

interface MainLayoutProps {
 children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
 return (
 <div className="flex flex-col min-h-screen">
 <DynamicNavigation />
 <main className="flex-1">{children}</main>
 <DynamicFooter />
 </div>
 );
}
