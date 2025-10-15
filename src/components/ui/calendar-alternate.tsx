"use client";

import * as React from "react";
import DatePicker, {
 registerLocale,
 ReactDatePickerCustomHeaderProps,
} from "react-datepicker";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import "react-datepicker/dist/react-datepicker.css";

// Enregistrement de la locale française
registerLocale("fr", fr);

export interface CalendarAlternateProps {
 selected?: Date;
 onSelect?: (date: Date) => void;
 disabled?: (date: Date) => boolean;
 enabledDays?: Date[];
 isFetching?: boolean;
 fullWidth?: boolean;
 className?: string;
}

export function CalendarAlternate({
 selected,
 onSelect,
 disabled,
 enabledDays = [],
 isFetching = false,
 fullWidth = false,
 className,
}: CalendarAlternateProps) {
 // Fonction qui vérifie si un jour est activé
 const isEnabled = React.useCallback(
 (date: Date) => {
 if (enabledDays.length === 0) return true;

 // Vérifie si la date est dans les jours activés
 return enabledDays.some(
 (enabledDay) =>
 enabledDay.getDate() === date.getDate() &&
 enabledDay.getMonth() === date.getMonth() &&
 enabledDay.getFullYear() === date.getFullYear()
 );
 },
 [enabledDays]
 );

 // Filtre qui combine la fonction disabled et la vérification des jours activés
 const filterDate = React.useCallback(
 (date: Date) => {
 if (disabled && disabled(date)) {
 return false;
 }
 return isEnabled(date);
 },
 [disabled, isEnabled]
 );

 // Rendu du jour personnalisé
 const renderDayContents = (day: number, date: Date) => {
 const isAvailable = isEnabled(date);

 return (
 <div
 className={cn(
 "relative flex items-center justify-center w-full h-full",
 isAvailable
 ? "after:absolute after:bottom-0 after:w-1.5 after:h-1.5 after:bg-blue-500 after:rounded-full"
 : ""
 )}
 >
 {day}
 </div>
 );
 };

 // Rendu de l'en-tête personnalisé pour les jours de la semaine
 const renderCustomHeader = ({
 date,
 decreaseMonth,
 increaseMonth,
 prevMonthButtonDisabled,
 nextMonthButtonDisabled,
 }: ReactDatePickerCustomHeaderProps) => (
 <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
 <Button
 onClick={decreaseMonth}
 disabled={prevMonthButtonDisabled}
 variant="ghost"
 size="sm"
 className="h-9 w-9 p-0 hover:bg-neutral-100"
 >
 <span className="sr-only">Mois précédent</span>
 <svg
 xmlns="http://www.w3.org/2000/svg"
 className="h-5 w-5"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 >
 <path d="M15 18l-6-6 6-6" />
 </svg>
 </Button>

 <h2 className="text-base font-medium text-neutral-900">
 {format(date, "MMMM yyyy", { locale: fr })}
 </h2>

 <Button
 onClick={increaseMonth}
 disabled={nextMonthButtonDisabled}
 variant="ghost"
 size="sm"
 className="h-9 w-9 p-0 hover:bg-neutral-100"
 >
 <span className="sr-only">Mois suivant</span>
 <svg
 xmlns="http://www.w3.org/2000/svg"
 className="h-5 w-5"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 >
 <path d="M9 18l6-6-6-6" />
 </svg>
 </Button>
 </div>
 );

 return (
 <div
 className={cn("relative", isFetching && "opacity-50 pointer-events-none")}
 >
 {isFetching && (
 <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-lg backdrop-blur-sm z-50">
 <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
 </div>
 )}

 <div
 className={cn(
 "p-2 bg-white rounded-lg border border-neutral-200 shadow-sm",
 fullWidth ? "w-full" : "w-auto",
 className
 )}
 >
 <DatePicker
 selected={selected}
 onChange={(date: Date | null) => date && onSelect && onSelect(date)}
 inline
 locale="fr"
 filterDate={filterDate}
 renderDayContents={renderDayContents}
 renderCustomHeader={renderCustomHeader}
 dayClassName={(date) =>
 cn(
 "text-base font-medium rounded-md hover:bg-blue-50",
 selected &&
 date.getTime() === selected.getTime() &&
 "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
 date.getDate() === new Date().getDate() &&
 date.getMonth() === new Date().getMonth() &&
 date.getFullYear() === new Date().getFullYear() &&
 "bg-neutral-100 border border-blue-400 font-medium"
 )
 }
 calendarClassName="!bg-transparent border-none !font-sans max-w-full"
 weekDayClassName={() => "text-sm font-medium text-neutral-500"}
 />
 </div>

 {/* Légende */}
 <div className="flex items-center justify-center gap-4 mt-4 text-sm text-neutral-600">
 <div className="flex items-center gap-1.5">
 <div className="h-3 w-3 rounded-full bg-blue-500"></div>
 <span>Jours disponibles</span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="h-3 w-3 rounded-full border border-blue-400"></div>
 <span>Aujourd&apos;hui</span>
 </div>
 </div>

 <style jsx global>{`
 /* Personnalisation du calendrier */
 .react-datepicker {
 font-family: inherit !important;
 border: none !important;
 background-color: white !important;
 border-radius: 8px !important;
 box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
 }

 .react-datepicker__header {
 background-color: white !important;
 border-bottom: 1px solid #e5e7eb !important;
 border-radius: 8px 8px 0 0 !important;
 }

 .react-datepicker__month-container {
 width: 100% !important;
 }

 .react-datepicker__day-names,
 .react-datepicker__week {
 display: flex !important;
 justify-content: space-between !important;
 }

 .react-datepicker__day-name {
 width: 44px !important;
 margin: 0 !important;
 padding: 10px 0 !important;
 text-align: center !important;
 text-transform: uppercase !important;
 color: #6b7280 !important; /* text-gray-500 */
 }

 .react-datepicker__day {
 width: 44px !important;
 height: 44px !important;
 margin: 0 !important;
 padding: 0 !important;
 display: flex !important;
 align-items: center !important;
 justify-content: center !important;
 border-radius: 8px !important;
 line-height: 44px !important;
 transition: all 0.15s ease !important;
 color: #111827 !important; /* text-gray-900 */
 }

 .react-datepicker__day:focus {
 outline: none !important;
 }

 .react-datepicker__day--disabled {
 color: #d1d5db !important; /* text-gray-300 */
 cursor: not-allowed !important;
 }

 .react-datepicker__day--outside-month {
 opacity: 0.5 !important;
 }

 /* Mode clair et sombre - styles uniformes */
 .react-datepicker__day:hover:not(.react-datepicker__day--disabled):not(
 .react-datepicker__day--selected
 ) {
 background-color: #eff6ff !important; /* bg-blue-50 */
 color: #1e3a8a !important; /* text-blue-900 */
 }

 .react-datepicker__day--selected {
 background-color: #2563eb !important; /* bg-blue-600 */
 color: white !important;
 }

 .react-datepicker__day--keyboard-selected {
 background-color: #3b82f6 !important; /* bg-blue-500 */
 color: white !important;
 }

 .react-datepicker__day--today {
 background-color: #f3f4f6 !important; /* bg-gray-100 */
 border: 1px solid #3b82f6 !important; /* border-blue-500 */
 color: #2563eb !important; /* text-blue-600 */
 font-weight: bold !important;
 }

 /* Styles adaptés pour le mode sombre */
 .dark .react-datepicker {
 background-color: #1f2937 !important; /* bg-gray-800 */
 border: 1px solid #374151 !important; /* border-gray-700 */
 }

 .dark .react-datepicker__header {
 background-color: #1f2937 !important; /* bg-gray-800 */
 border-bottom: 1px solid #374151 !important; /* border-gray-700 */
 }

 .dark .react-datepicker__day-name {
 color: #9ca3af !important; /* text-gray-400 */
 }

 .dark .react-datepicker__day {
 color: #f9fafb !important; /* text-gray-50 */
 }

 .dark
 .react-datepicker__day:hover:not(
 .react-datepicker__day--disabled
 ):not(.react-datepicker__day--selected) {
 background-color: #1e40af !important; /* bg-blue-800 */
 color: #f9fafb !important; /* text-gray-50 */
 }

 .dark .react-datepicker__day--disabled {
 color: #6b7280 !important; /* text-gray-500 */
 }

 .dark .react-datepicker__day--today {
 background-color: #374151 !important; /* bg-gray-700 */
 border: 1px solid #3b82f6 !important; /* border-blue-500 */
 color: #3b82f6 !important; /* text-blue-500 */
 }

 .dark .react-datepicker__navigation-icon::before {
 border-color: #3b82f6 !important; /* border-blue-500 */
 }

 .dark .react-datepicker__current-month {
 color: #f9fafb !important; /* text-gray-50 */
 }

 /* Style spécifique pour le mois et l'année en mode sombre */
 .dark h2.text-base.font-medium.text-neutral-900 {
 color: #f9fafb !important; /* text-gray-50 */
 }

 /* Indicateur des jours disponibles en mode sombre */
 .dark
 .react-datepicker
 .flex.items-center.justify-center.w-full.h-full
 .after\\:absolute {
 color: #f9fafb !important; /* text-gray-50 */
 }
 \\:absolute.after\\:bottom-0.after\\:w-1\\.5.after\\:h-1\\.5.after\\:bg-blue-500.after\\:rounded-full {
 background-color: white !important;
 }
 .dark .react-datepicker .after\\:bg-blue-500 {
 background-color: #3b82f6 !important; /* bg-blue-500 */
 }
 `}</style>
 </div>
 );
}
