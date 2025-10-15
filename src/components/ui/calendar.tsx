"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
 enabledDays?: Date[];
 isFetching?: boolean;
 fullWidth?: boolean;
};

function Calendar({
 className,
 classNames,
 showOutsideDays = true,
 enabledDays,
 isFetching,
 fullWidth = false,
 ...props
}: CalendarProps) {
 const handleIsDayEnabled = React.useCallback(
 (day: Date) => {
 if (!enabledDays || enabledDays.length === 0) return true;
 return enabledDays.some(
 (enabledDay) =>
 enabledDay.getDate() === day.getDate() &&
 enabledDay.getMonth() === day.getMonth() &&
 enabledDay.getFullYear() === day.getFullYear()
 );
 },
 [enabledDays]
 );

 return (
 <div
 className={cn(
 "relative transition-opacity duration-200",
 isFetching ? "opacity-70 pointer-events-none" : "opacity-100"
 )}
 >
 {isFetching && (
 <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-xl backdrop-blur-sm z-50">
 <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
 </div>
 )}
 <DayPicker
 showOutsideDays={showOutsideDays}
 className={cn(
 "bg-white p-3 rounded-xl border border-neutral-200 shadow-md",
 fullWidth ? "w-full" : "",
 className
 )}
 locale={fr}
 captionLayout="dropdown"
 modifiers={{
 available: handleIsDayEnabled,
 }}
 modifiersClassNames={{
 available: "available-day",
 unavailable: "unavailable-day",
 }}
 classNames={{
 months:
 "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
 month: "space-y-4",
 caption:
 "flex justify-center relative items-center pt-1 pb-2 mb-2 border-b border-neutral-200",
 caption_label: "text-sm font-medium text-blue-800",
 caption_dropdowns: "flex justify-center gap-1",
 dropdown:
 "bg-white border border-neutral-200 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500:ring-blue-400",
 dropdown_month: "text-neutral-800 font-medium",
 dropdown_year: "text-neutral-800 font-medium",
 dropdown_icon: "hidden",
 nav: "flex items-center space-x-1",
 nav_button: cn(
 buttonVariants({ variant: "ghost", size: "icon" }),
 "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100"
 ),
 nav_button_previous: "absolute left-1",
 nav_button_next: "absolute right-1",
 table: "w-full border-collapse",
 head_row: "grid grid-cols-7",
 head_cell:
 "text-xs text-center font-medium text-neutral-500 py-2",
 row: "grid grid-cols-7",
 cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-50)]:bg-blue-950/50 focus-within:relative focus-within:z-20",
 day: cn(
 buttonVariants({ variant: "ghost" }),
 "h-8 w-8 p-0 font-normal text-sm aria-selected:opacity-100 mx-auto"
 ),
 day_selected:
 "bg-blue-600 hover:bg-blue-600 text-white hover:text-white focus:bg-blue-600",
 day_today:
 "bg-neutral-100 text-blue-700 border border-blue-400",
 day_outside: "text-neutral-400 opacity-50",
 day_disabled:
 "text-neutral-400 opacity-50 cursor-not-allowed",
 day_hidden: "invisible",
 ...classNames,
 }}
 styles={{
 caption_dropdowns: { marginLeft: "auto", marginRight: "auto" },
 dropdown_month: { padding: "0.2rem 1.5rem 0.2rem 0.5rem" },
 dropdown_year: { padding: "0.2rem 1.5rem 0.2rem 0.5rem" },
 }}
 {...props}
 />

 {/* Légende */}
 <div className="flex items-center justify-center gap-4 mt-3 text-xs text-neutral-600">
 <div className="flex items-center gap-1.5">
 <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
 <span>Jours disponibles</span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="h-2.5 w-2.5 rounded-full border border-blue-400"></div>
 <span>Aujourd&apos;hui</span>
 </div>
 </div>

 <style jsx global>{`
 .rdp-day {
 margin: 0 auto;
 }

 .available-day {
 position: relative;
 }

 .available-day::after {
 content: "";
 position: absolute;
 bottom: 1px;
 left: 50%;
 transform: translateX(-50%);
 width: 3px;
 height: 3px;
 background-color: #3b82f6;
 border-radius: 50%;
 }

 .rdp-day:hover .available-day::after {
 background-color: #2563eb;
 }
 `}</style>
 </div>
 );
}
Calendar.displayName = "Calendar";

export { Calendar };
