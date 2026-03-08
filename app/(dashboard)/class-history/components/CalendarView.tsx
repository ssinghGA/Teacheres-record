"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { type ApiClass } from "@/lib/hooks/useClasses";
import { useTheme } from "next-themes";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarViewProps {
    data: ApiClass[];
    onEventClick: (c: ApiClass) => void;
}

export default function CalendarView({ data, onEventClick }: CalendarViewProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const getStudentName = (c: ApiClass) =>
        typeof c.studentId === 'object' ? c.studentId.name : 'N/A';

    const events = data.map(c => {
        // Construct standard JS Date objects from the string date and time
        const startDateString = `${c.date.split('T')[0]}T${c.time}:00`;
        const start = new Date(startDateString);

        // Add duration in minutes to start time
        const end = new Date(start.getTime() + c.duration * 60000);

        return {
            title: `${c.subject} - ${getStudentName(c)}`,
            start,
            end,
            resource: c,
        };
    });

    const eventPropGetter = (event: any) => {
        const c = event.resource as ApiClass;

        // Match our application's badge colors
        let backgroundColor = '#3b82f6'; // Scheduled (blue)
        if (c.status === 'completed') backgroundColor = '#10b981'; // green
        if (c.status === 'cancelled') backgroundColor = '#ef4444'; // red
        if (c.status === 'rescheduled') backgroundColor = '#f97316'; // orange

        return {
            style: {
                backgroundColor,
                border: 'none',
                opacity: 0.9,
                color: 'white',
                borderRadius: '6px',
            }
        };
    };

    return (
        <div className="h-[600px] w-full p-4 bg-card rounded-xl border border-border shadow-sm">
            {/* 
                We add a wrapper div with a custom class to target and override 
                react-big-calendar's default styles for dark mode if necessary.
            */}
            <div className={`h-full w-full ${isDark ? 'rbc-dark' : ''}`}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .rbc-dark .rbc-month-view, .rbc-dark .rbc-time-view, .rbc-dark .rbc-header {
                        border-color: var(--border);
                    }
                    .rbc-dark .rbc-day-bg { border-color: var(--border); }
                    .rbc-dark .rbc-off-range-bg { background-color: var(--muted); }
                    .rbc-dark .rbc-today { background-color: rgba(59, 130, 246, 0.1); }
                    .rbc-dark .rbc-button-link { color: var(--foreground); }
                    .rbc-dark .rbc-event { box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
                `}} />

                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%", color: isDark ? 'var(--foreground)' : 'inherit' }}
                    onSelectEvent={(e: any) => onEventClick(e.resource)}
                    eventPropGetter={eventPropGetter}
                    views={['month', 'week', 'day']}
                    defaultView="month"
                    popup
                />
            </div>
        </div>
    );
}
