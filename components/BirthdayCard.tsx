import React, { useState } from 'react';
import { Cake, Send, Check, Loader2, X } from 'lucide-react';
import { Policy } from '../types';
import { sendWhatsAppMessage, generateBirthdayMessage, isBirthdayToday, daysUntilBirthday } from '../services/evolutionApi';

interface BirthdayCardProps {
    policies: Policy[];
}

interface SendStatus {
    [key: string]: 'idle' | 'sending' | 'sent' | 'error';
}

export function BirthdayCard({ policies }: BirthdayCardProps) {
    const [sendStatus, setSendStatus] = useState<SendStatus>({});
    const [autoSendEnabled, setAutoSendEnabled] = useState(false);

    // Filtrar clientes con cumpleaños hoy
    const birthdaysToday = policies.filter(p => p.fechaNacimiento && isBirthdayToday(p.fechaNacimiento));

    // Próximos cumpleaños (próximos 7 días)
    const upcomingBirthdays = policies
        .filter(p => {
            if (!p.fechaNacimiento) return false;
            const days = daysUntilBirthday(p.fechaNacimiento);
            return days > 0 && days <= 7;
        })
        .sort((a, b) => daysUntilBirthday(a.fechaNacimiento!) - daysUntilBirthday(b.fechaNacimiento!));

    const handleSendMessage = async (policy: Policy) => {
        if (!policy.telefono) return;

        setSendStatus(prev => ({ ...prev, [policy.id]: 'sending' }));

        const message = generateBirthdayMessage(policy.nombre);
        const result = await sendWhatsAppMessage({
            phone: policy.telefono,
            message,
        });

        setSendStatus(prev => ({
            ...prev,
            [policy.id]: result.success ? 'sent' : 'error'
        }));

        // Reset después de 3 segundos
        setTimeout(() => {
            setSendStatus(prev => ({ ...prev, [policy.id]: 'idle' }));
        }, 3000);
    };

    const getButtonContent = (status: string | undefined) => {
        switch (status) {
            case 'sending':
                return <Loader2 className="w-4 h-4 animate-spin" />;
            case 'sent':
                return <Check className="w-4 h-4 text-green-500" />;
            case 'error':
                return <X className="w-4 h-4 text-red-500" />;
            default:
                return <Send className="w-4 h-4" />;
        }
    };

    if (birthdaysToday.length === 0 && upcomingBirthdays.length === 0) {
        return null; // No mostrar si no hay cumpleaños
    }

    return (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-2xl border border-pink-200 dark:border-pink-800/50 p-6 mb-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-pink-500 p-2 rounded-lg">
                        <Cake className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Cumpleaños
                    </h3>
                </div>

                {/* Toggle de envío automático */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Auto-envío</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={autoSendEnabled}
                            onChange={(e) => setAutoSendEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </div>
                </label>
            </div>

            {/* Cumpleaños de hoy */}
            {birthdaysToday.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-2 flex items-center gap-1">
                        🎂 ¡Hoy!
                    </h4>
                    <div className="space-y-2">
                        {birthdaysToday.map(policy => (
                            <div
                                key={policy.id}
                                className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-pink-100 dark:border-pink-900/50"
                            >
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">{policy.nombre}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{policy.telefono}</p>
                                </div>
                                <button
                                    onClick={() => handleSendMessage(policy)}
                                    disabled={sendStatus[policy.id] === 'sending' || sendStatus[policy.id] === 'sent'}
                                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 dark:disabled:bg-pink-900 text-white rounded-lg text-sm font-medium transition-all active:scale-95"
                                >
                                    {getButtonContent(sendStatus[policy.id])}
                                    <span className="hidden sm:inline">
                                        {sendStatus[policy.id] === 'sent' ? '¡Enviado!' : 'Felicitar'}
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Próximos cumpleaños */}
            {upcomingBirthdays.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                        📅 Próximos 7 días
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {upcomingBirthdays.map(policy => {
                            const days = daysUntilBirthday(policy.fechaNacimiento!);
                            return (
                                <div
                                    key={policy.id}
                                    className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 text-sm"
                                >
                                    <span className="text-slate-700 dark:text-slate-300 truncate">{policy.nombre}</span>
                                    <span className="text-pink-500 dark:text-pink-400 font-medium whitespace-nowrap ml-2">
                                        {days === 1 ? 'Mañana' : `En ${days} días`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
