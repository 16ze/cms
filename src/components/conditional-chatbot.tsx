"use client";

import { usePathname } from "next/navigation";
import KAIROChatbot from "@/components/ui/kairo-chatbot";

export default function ConditionalChatbot() {
 const pathname = usePathname();

 // Ne pas afficher le chatbot sur les pages admin
 if (pathname?.startsWith("/admin")) {
 return null;
 }

 // Afficher le chatbot sur toutes les autres pages (client)
 return <KAIROChatbot />;
}

