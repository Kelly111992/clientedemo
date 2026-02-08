import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Calendar, Clock, MapPin, RefreshCw, LogIn, ExternalLink } from 'lucide-react';

interface CalendarEvent {
    id: string;
    summary: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    location?: string;
    htmlLink: string;
}

export const CalendarWidget: React.FC = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('google_calendar_token'));
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            setToken(tokenResponse.access_token);
            localStorage.setItem('google_calendar_token', tokenResponse.access_token);
            fetchEvents(tokenResponse.access_token);
        },
        onError: () => setError('Error al conectar con Google'),
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly'
    });

    const fetchEvents = async (accessToken: string) => {
        setLoading(true);
        setError(null);
        try {
            // Fetch upcoming events
            const timeMin = new Date().toISOString();
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=5&orderBy=startTime&singleEvents=true`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired
                    setToken(null);
                    localStorage.removeItem('google_calendar_token');
                    throw new Error('Sesión expirada. Por favor reconecta.');
                }
                throw new Error('Error al obtener eventos');
            }

            const data = await response.json();
            setEvents(data.items || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchEvents(token);
        }
    }, [token]);

    const formatEventTime = (isoString?: string) => {
        if (!isoString) return 'Todo el día';
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    const formatEventDate = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        // Si es hoy, devolver "Hoy"
        const today = new Date();
        if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
            return 'Hoy';
        }
        // Si es mañana
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear()) {
            return 'Mañana';
        }

        return new Intl.DateTimeFormat('es-MX', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        }).format(date);
    };

    if (!token) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Google Calendar</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
                    Conecta tu cuenta para ver tus próximas citas y renovaciones.
                </p>
                <button
                    onClick={() => login()}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    Conectar Calendar
                </button>
                {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Agenda
                </h3>
                <button
                    onClick={() => fetchEvents(token)}
                    disabled={loading}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Actualizar"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                {loading && events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                        <span className="text-xs">Cargando eventos...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-4">
                        <p className="text-sm text-red-500 mb-2">{error}</p>
                        <button onClick={() => login()} className="text-xs text-blue-600 hover:underline">Reconectar</button>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
                        <p>No hay eventos próximos.</p>
                        <p className="text-xs mt-1 opacity-70">¡Tienes la agenda libre! 🎉</p>
                    </div>
                ) : (
                    events.map((event) => {
                        const isAllDay = !event.start.dateTime;
                        const startDisplay = isAllDay ? event.start.date : event.start.dateTime;
                        const dateLabel = formatEventDate(startDisplay);

                        return (
                            <a
                                key={event.id}
                                href={event.htmlLink}
                                target="_blank"
                                rel="noreferrer"
                                className="block group p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{dateLabel}</span>
                                    {!isAllDay && (
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            {formatEventTime(event.start.dateTime)}
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors line-clamp-1">
                                    {event.summary || '(Sin título)'}
                                </h4>
                                {event.location && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                        <MapPin className="w-3 h-3" />
                                        {event.location}
                                    </div>
                                )}
                            </a>
                        );
                    })
                )}
            </div>

            {token && (
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-right">
                    <button onClick={() => { setToken(null); localStorage.removeItem('google_calendar_token'); }} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                        Desconectar
                    </button>
                </div>
            )}
        </div>
    );
};
