import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, Check, Trash2 } from 'lucide-react';

export interface CalendarEvent {
    id?: string;
    summary: string;
    description?: string;
    location?: string;
    start: { dateTime?: string; date?: string; timeZone?: string };
    end: { dateTime?: string; date?: string; timeZone?: string };
}

interface CalendarEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: CalendarEvent) => Promise<void>;
    onDelete?: (eventId: string) => Promise<void>;
    event?: CalendarEvent;
    initialDate?: Date;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    event,
    initialDate
}) => {
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper to format date as YYYY-MM-DD in LOCAL time
    const toLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (isOpen) {
            if (event) {
                setSummary(event.summary || '');
                setDescription(event.description || '');
                setLocation(event.location || '');

                // Handle both dateTime (specific time) and date (all-day)
                let start, end;
                let sTime = '09:00';
                let eTime = '10:00';

                if (event.start.dateTime) {
                    start = new Date(event.start.dateTime);
                    sTime = start.toTimeString().slice(0, 5);
                } else if (event.start.date) {
                    const parts = event.start.date.split('-');
                    start = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                } else {
                    start = new Date();
                }

                if (event.end.dateTime) {
                    end = new Date(event.end.dateTime);
                    eTime = end.toTimeString().slice(0, 5);
                } else if (event.end.date) {
                    const parts = event.end.date.split('-');
                    end = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                } else {
                    end = new Date(start);
                    end.setHours(start.getHours() + 1);
                }

                setStartDate(toLocalDateString(start));
                setStartTime(sTime);
                setEndDate(toLocalDateString(end));
                setEndTime(eTime);
            } else {
                const now = initialDate || new Date();
                const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

                setSummary('');
                setDescription('');
                setLocation('');
                setStartDate(toLocalDateString(now));
                setStartTime(now.toTimeString().slice(0, 5));
                setEndDate(toLocalDateString(oneHourLater));
                setEndTime(oneHourLater.toTimeString().slice(0, 5));
            }
        }
    }, [isOpen, event, initialDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!summary || !startDate || !endDate) return;

        setIsSubmitting(true);
        try {
            const startDateTime = new Date(`${startDate}T${startTime || '09:00'}:00`).toISOString();
            const endDateTime = new Date(`${endDate}T${endTime || '10:00'}:00`).toISOString();

            const newEvent: CalendarEvent = {
                id: event?.id,
                summary,
                description,
                location,
                start: { dateTime: startDateTime },
                end: { dateTime: endDateTime }
            };

            await onSave(newEvent);
            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!event?.id || !onDelete) return;
        if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            setIsSubmitting(true);
            try {
                await onDelete(event.id);
                onClose();
            } catch (error) {
                console.error('Error deleting event:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {event ? 'Editar Evento' : 'Nuevo Evento'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Título</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="Ej. Reunión con Cliente"
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Inicio</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full mt-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fin</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full mt-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ubicación</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Ej. Oficina, Zoom, etc."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Descripción</label>
                        <div className="relative">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Detalles adicionales..."
                                rows={3}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            />
                            <AlignLeft className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        {event && onDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                            </button>
                        )}
                        <div className={`flex gap-3 ${!event ? 'w-full justify-end' : ''}`}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-md shadow-blue-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {event ? 'Guardar Cambios' : 'Crear Evento'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
