import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Calendar, Clock, MapPin, RefreshCw, Plus, Edit2, LogOut } from 'lucide-react';
import { CalendarEventModal, CalendarEvent } from './CalendarEventModal';
import { exchangeCodeForToken, refreshAccessToken } from '../utils/googleAuth';

export const CalendarWidget: React.FC = () => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('google_access_token'));
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);

    // Check for secret on mount to warn user (though now we have it)
    const hasSecret = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_SECRET);

    const login = useGoogleLogin({
        flow: 'auth-code', // Use Authorization Code flow for offline access
        scope: 'https://www.googleapis.com/auth/calendar.events',
        onSuccess: async (codeResponse) => {
            setLoading(true);
            try {
                const data = await exchangeCodeForToken(codeResponse.code);
                if (data) {
                    setToken(data.access_token);
                    localStorage.setItem('google_access_token', data.access_token);
                    if (data.refresh_token) {
                        localStorage.setItem('google_refresh_token', data.refresh_token);
                    }
                    fetchEvents(data.access_token);
                } else {
                    setError('Error: Client Secret faltante o incorrecto');
                }
            } catch (err) {
                setError('Error al intercambiar token');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Error al conectar con Google'),
    });

    const logout = () => {
        setToken(null);
        setEvents([]);
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_refresh_token');
    };

    const getValidToken = async () => {
        let currentToken = localStorage.getItem('google_access_token');
        const refreshToken = localStorage.getItem('google_refresh_token');

        if (!currentToken && !refreshToken) return null;

        if (currentToken) return currentToken;

        if (refreshToken) {
            const newToken = await refreshAccessToken(refreshToken);
            if (newToken) {
                setToken(newToken);
                localStorage.setItem('google_access_token', newToken);
                return newToken;
            }
        }
        return null;
    };

    const fetchEvents = async (accessToken: string | null = null) => {
        const activeToken = accessToken || await getValidToken();
        if (!activeToken) {
            setToken(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const timeMin = new Date().toISOString();
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&orderBy=startTime&singleEvents=true`,
                {
                    headers: { Authorization: `Bearer ${activeToken}` },
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired, try to refresh once
                    const refreshToken = localStorage.getItem('google_refresh_token');
                    if (refreshToken) {
                        const newToken = await refreshAccessToken(refreshToken);
                        if (newToken) {
                            setToken(newToken);
                            localStorage.setItem('google_access_token', newToken);
                            // Retry fetch with new token
                            return fetchEvents(newToken);
                        }
                    }
                    // If refresh failed or no refresh token
                    logout();
                    throw new Error('Sesión expirada. Por favor reconecta.');
                }
                throw new Error('Error al obtener eventos');
            }

            const data = await response.json();
            setEvents(data.items || []);
        } catch (err) {
            console.error(err);
            if (err instanceof Error && err.message.includes('Sesión expirada')) {
                // Already handled
            } else {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (event: CalendarEvent) => {
        const activeToken = await getValidToken();
        if (!activeToken) return;

        try {
            const response = await fetch(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${activeToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(event),
                }
            );

            if (!response.ok) throw new Error('Error al crear evento');
            await fetchEvents(activeToken);
        } catch (err) {
            console.error(err);
            alert('No se pudo crear el evento');
        }
    };

    const handleUpdateEvent = async (event: CalendarEvent) => {
        const activeToken = await getValidToken();
        if (!activeToken || !event.id) return;

        try {
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${activeToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(event),
                }
            );

            if (!response.ok) throw new Error('Error al actualizar evento');
            await fetchEvents(activeToken);
        } catch (err) {
            console.error(err);
            alert('No se pudo actualizar el evento');
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        const activeToken = await getValidToken();
        if (!activeToken) return;

        try {
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${activeToken}` },
                }
            );

            if (!response.ok) throw new Error('Error al eliminar evento');
            await fetchEvents(activeToken);
        } catch (err) {
            console.error(err);
            alert('No se pudo eliminar el evento');
        }
    };

    const handleSave = async (event: CalendarEvent) => {
        if (event.id) {
            await handleUpdateEvent(event);
        } else {
            await handleCreateEvent(event);
        }
    };

    // Initial load
    useEffect(() => {
        // Try to fetch events on mount if we have tokens or refresh token
        fetchEvents();
    }, []);

    // Helper to parse date correctly regardless of format
    const getEventDateObj = (event: CalendarEvent) => {
        if (event.start.dateTime) {
            return new Date(event.start.dateTime);
        }
        if (event.start.date) {
            // Parse YYYY-MM-DD as local midnight using string manipulation to avoid UTC shift
            const parts = event.start.date.split('-');
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        return new Date();
    };

    const formatEventDate = (event: CalendarEvent) => {
        const date = getEventDateObj(event);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isSameDay = (d1: Date, d2: Date) =>
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();

        if (isSameDay(date, today)) return 'Hoy';
        if (isSameDay(date, tomorrow)) return 'Mañana';

        return new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
    };

    const formatEventTime = (isoString?: string) => {
        if (!isoString) return 'Todo el día';
        return new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(isoString));
    };


    if (!token) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Google Calendar</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
                    Conecta tu cuenta para gestionar tus citas directamente desde aquí.
                </p>

                {!hasSecret ? (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 text-left">
                        <strong>⚠️ Configuración Requerida</strong><br />
                        Falta el <code>VITE_GOOGLE_CLIENT_SECRET</code> en tu archivo .env para habilitar la conexión permanente.
                    </div>
                ) : (
                    <button
                        onClick={() => login()}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        Conectar Calendar (Permanente)
                    </button>
                )}

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
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => { setSelectedEvent(undefined); setIsModalOpen(true); }}
                        className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors text-blue-600 dark:text-blue-400"
                        title="Nuevo Evento"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => fetchEvents()}
                        disabled={loading}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Actualizar"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
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
                        <button
                            onClick={() => { setSelectedEvent(undefined); setIsModalOpen(true); }}
                            className="text-blue-600 dark:text-blue-400 text-xs mt-2 hover:underline"
                        >
                            + Crear primera cita
                        </button>
                    </div>
                ) : (
                    events.map((event) => {
                        const isAllDay = !event.start.dateTime;
                        const dateLabel = formatEventDate(event);

                        return (
                            <div
                                key={event.id}
                                className="group relative p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer pr-10"
                                onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
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

                                <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                                    <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <CalendarEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onDelete={handleDeleteEvent}
                event={selectedEvent}
            />

            {token && (
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-right">
                    <button onClick={() => logout()} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors ml-auto">
                        <LogOut className="w-3 h-3" /> Desconectar (Limpiar Sesión)
                    </button>
                </div>
            )}
        </div>
    );
};
