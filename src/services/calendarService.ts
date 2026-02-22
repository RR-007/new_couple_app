// --- Types ---

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;       // ISO datetime
    end: string;         // ISO datetime
    allDay: boolean;
    location?: string;
    description?: string;
    source: 'you' | 'partner';
    isTravel: boolean;
}

// --- Helpers ---

const TRAVEL_KEYWORDS = ['flight', 'airport', 'hotel', 'train', 'booking', 'trip', 'travel', 'vacation', 'resort'];

const detectTravel = (title: string, location?: string): boolean => {
    const text = `${title} ${location || ''}`.toLowerCase();
    return TRAVEL_KEYWORDS.some((kw) => text.includes(kw));
};

const formatTime = (dateStr: string, allDay: boolean): string => {
    if (allDay) return 'All day';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export { formatTime };

// --- Fetch from Google Calendar API ---

export const fetchCalendarEvents = async (
    accessToken: string,
    daysAhead: number = 30
): Promise<CalendarEvent[]> => {
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        timeMin
    )}&timeMax=${encodeURIComponent(
        timeMax
    )}&singleEvents=true&orderBy=startTime&maxResults=100`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google Calendar API error: ${res.status} — ${errText}`);
    }

    const data = await res.json();
    const items = data.items || [];

    return items.map((item: any) => {
        const allDay = !!item.start?.date && !item.start?.dateTime;
        const start = item.start?.dateTime || item.start?.date || '';
        const end = item.end?.dateTime || item.end?.date || '';
        const title = item.summary || '(No title)';

        return {
            id: item.id,
            title,
            start,
            end,
            allDay,
            location: item.location || undefined,
            description: item.description || undefined,
            source: 'you' as const,
            isTravel: detectTravel(title, item.location),
        };
    });
};

// --- Merge Events ---

export const mergeEvents = (
    myEvents: CalendarEvent[],
    partnerEvents: CalendarEvent[]
): CalendarEvent[] => {
    const tagged = [
        ...myEvents.map((e) => ({ ...e, source: 'you' as const })),
        ...partnerEvents.map((e) => ({ ...e, source: 'partner' as const })),
    ];

    return tagged.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
};

// --- Group by Date ---

export interface DayGroup {
    date: string;   // YYYY-MM-DD
    label: string;  // "Today", "Tomorrow", "Thu, Feb 27"
    events: CalendarEvent[];
}

export const groupByDate = (events: CalendarEvent[]): DayGroup[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const groups: Record<string, CalendarEvent[]> = {};

    for (const event of events) {
        const dateStr = event.start.split('T')[0];
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(event);
    }

    const sortedDates = Object.keys(groups).sort();

    return sortedDates.map((dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        let label: string;

        if (d.getTime() === today.getTime()) {
            label = 'Today';
        } else if (d.getTime() === tomorrow.getTime()) {
            label = 'Tomorrow';
        } else {
            label = d.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        }

        return { date: dateStr, label, events: groups[dateStr] };
    });
};
