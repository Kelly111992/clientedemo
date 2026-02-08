import React from 'react';
import { Policy } from '../types';
import { AlertTriangle, Clock, Bell, Phone, Calendar, ChevronRight } from 'lucide-react';
import { getDaysDifference, formatDate, getExpirationCategory, formatDaysRemaining, ExpirationCategory } from '../utils/dateUtils';

interface ExpirationCardProps {
    policies: Policy[];
    onEditPolicy?: (policy: Policy) => void;
}

export const ExpirationCard: React.FC<ExpirationCardProps> = ({ policies, onEditPolicy }) => {
    // Filtrar pólizas que vencen en los próximos 30 días o ya vencieron
    const expiringPolicies = policies
        .map(policy => ({
            ...policy,
            daysRemaining: getDaysDifference(policy.vigencia),
            category: getExpirationCategory(policy.vigencia)
        }))
        .filter(p => p.category !== 'ok')
        .sort((a, b) => a.daysRemaining - b.daysRemaining);

    const criticalCount = expiringPolicies.filter(p => p.category === 'critical' || p.category === 'expired').length;
    const warningCount = expiringPolicies.filter(p => p.category === 'warning').length;
    const upcomingCount = expiringPolicies.filter(p => p.category === 'upcoming').length;

    const getCategoryStyles = (category: ExpirationCategory) => {
        switch (category) {
            case 'expired':
                return {
                    bg: 'bg-slate-100 dark:bg-slate-700',
                    text: 'text-slate-600 dark:text-slate-400',
                    badge: 'bg-slate-500 text-white',
                    icon: '💀'
                };
            case 'critical':
                return {
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    text: 'text-red-700 dark:text-red-400',
                    badge: 'bg-red-500 text-white animate-pulse',
                    icon: '🚨'
                };
            case 'warning':
                return {
                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                    text: 'text-amber-700 dark:text-amber-400',
                    badge: 'bg-amber-500 text-white',
                    icon: '⚠️'
                };
            case 'upcoming':
                return {
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    text: 'text-blue-700 dark:text-blue-400',
                    badge: 'bg-blue-500 text-white',
                    icon: '📅'
                };
            default:
                return {
                    bg: 'bg-slate-50 dark:bg-slate-800',
                    text: 'text-slate-600 dark:text-slate-400',
                    badge: 'bg-slate-500 text-white',
                    icon: '✓'
                };
        }
    };

    if (expiringPolicies.length === 0) {
        return (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 mb-6 border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-2xl">
                        ✅
                    </div>
                    <div>
                        <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Todo en orden</h3>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">No hay pólizas próximas a vencer en los próximos 30 días</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-6 transition-colors">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                Alertas de Vencimiento
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                    {expiringPolicies.length}
                                </span>
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pólizas que requieren atención</p>
                        </div>
                    </div>

                    {/* Summary badges */}
                    <div className="hidden sm:flex items-center gap-2">
                        {criticalCount > 0 && (
                            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                                🚨 {criticalCount} críticas
                            </span>
                        )}
                        {warningCount > 0 && (
                            <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                                ⚠️ {warningCount} advertencia
                            </span>
                        )}
                        {upcomingCount > 0 && (
                            <span className="px-2.5 py-1 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                                📅 {upcomingCount} próximas
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Policy List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
                {expiringPolicies.map((policy) => {
                    const styles = getCategoryStyles(policy.category);
                    return (
                        <div
                            key={policy.id}
                            className={`p-4 ${styles.bg} hover:brightness-95 dark:hover:brightness-110 transition-all cursor-pointer group`}
                            onClick={() => onEditPolicy?.(policy)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{styles.icon}</span>
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">{policy.nombre}</p>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {policy.telefono}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(policy.vigencia)}
                                            </span>
                                            <span className="font-mono text-slate-400">#{policy.poliza}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 ${styles.badge} text-xs font-bold rounded-full whitespace-nowrap`}>
                                        {formatDaysRemaining(policy.vigencia)}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer tip */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    💡 Click en una póliza para editarla y actualizar la fecha de vigencia
                </p>
            </div>
        </div>
    );
};
