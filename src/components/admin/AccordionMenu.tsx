"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

interface AccordionItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface AccordionMenuProps {
  title: string;
  icon: React.ComponentType<any>;
  items: AccordionItem[];
  isActive: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export default function AccordionMenu({
  title,
  icon: Icon,
  items,
  isActive,
  defaultOpen = false,
  className = ""
}: AccordionMenuProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || isActive);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={className}>
      {/* Header de l'accordéon */}
      <button
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          isActive
            ? "bg-blue-100 text-blue-700 border border-blue-200"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center">
          <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        )}
      </button>

      {/* Contenu de l'accordéon */}
      {isOpen && (
        <div className="mt-1 ml-6 space-y-1">
          {items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                  isActive
                    ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <ItemIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
