import React, { useState, useMemo } from 'react';
import { Policy, RamoType } from '../types';
import { Search, Filter, Phone, AlertTriangle, Pencil, Trash2, Calendar, CheckCircle2, AlertOctagon } from 'lucide-react';
import { isExpiringSoon, formatDate, getExpirationCategory, ExpirationCategory, getDaysDifference } from '../utils/dateUtils';
import { RAMO_COLORS } from '../constants';

interface PolicyTableProps {
  policies: Policy[];
  onEdit?: (policy: Policy) => void;
  onDelete?: (policy: Policy) => void;
}

type FilterStatus = 'all' | 'critical' | 'warning' | 'upcoming';

export const PolicyTable: React.FC<PolicyTableProps> = ({ policies, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRamo, setFilterRamo] = useState<RamoType | 'Todos'>('Todos');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Calcular contadores para los badges
  const stats = useMemo(() => {
    return policies.reduce((acc, policy) => {
      const category = getExpirationCategory(policy.vigencia);
      if (category === 'critical' || category === 'expired') acc.critical++;
      if (category === 'warning') acc.warning++;
      if (category === 'upcoming') acc.upcoming++;
      return acc;
    }, { critical: 0, warning: 0, upcoming: 0 });
  }, [policies]);

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.poliza.includes(searchTerm);

    const matchesRamo = filterRamo === 'Todos' || policy.ramo === filterRamo;

    let matchesStatus = true;
    const category = getExpirationCategory(policy.vigencia);

    if (filterStatus === 'critical') matchesStatus = category === 'critical' || category === 'expired';
    if (filterStatus === 'warning') matchesStatus = category === 'warning';
    if (filterStatus === 'upcoming') matchesStatus = category === 'upcoming';

    return matchesSearch && matchesRamo && matchesStatus;
  });

  const getRamoBadgeColor = (ramo: string) => {
    switch (ramo) {
      case 'Vida': return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30';
      case 'Gastos Médicos': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-500/30';
      case 'Auto': return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-500/30';
      default: return 'bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">

      {/* Integrated Header with Alerts */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700">
        <div className="flex flex-col gap-4">

          {/* Title and Alert Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                Cartera de Clientes
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded-full">
                  {policies.length}
                </span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Gestiona tus pólizas y renovaciones</p>
            </div>

            {/* Alert Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${filterStatus === 'all'
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
              >
                Todas
              </button>

              {stats.critical > 0 && (
                <button
                  onClick={() => setFilterStatus('critical')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 ${filterStatus === 'critical'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-500/20'
                      : 'text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                >
                  <AlertOctagon className="w-4 h-4" />
                  Críticas
                  <span className="bg-red-200 dark:bg-red-800 px-1.5 py-0.5 rounded-full text-[10px] leading-none min-w-[1.25rem] text-center">
                    {stats.critical}
                  </span>
                </button>
              )}

              {stats.warning > 0 && (
                <button
                  onClick={() => setFilterStatus('warning')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 ${filterStatus === 'warning'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-500/20'
                      : 'text-slate-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Alertas
                  <span className="bg-amber-200 dark:bg-amber-800 px-1.5 py-0.5 rounded-full text-[10px] leading-none min-w-[1.25rem] text-center">
                    {stats.warning}
                  </span>
                </button>
              )}

              {stats.upcoming > 0 && (
                <button
                  onClick={() => setFilterStatus('upcoming')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 ${filterStatus === 'upcoming'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-500/20'
                      : 'text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                >
                  <Calendar className="w-4 h-4" />
                  Próximas
                  <span className="bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded-full text-[10px] leading-none min-w-[1.25rem] text-center">
                    {stats.upcoming}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Search and Ramo Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar cliente, teléfono o póliza..."
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full transition-all dark:text-white dark:placeholder-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                className="pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none w-full sm:w-auto cursor-pointer dark:text-white"
                value={filterRamo}
                onChange={(e) => setFilterRamo(e.target.value as any)}
              >
                <option value="Todos">Todos los Ramos</option>
                <option value="Vida">Vida</option>
                <option value="Gastos Médicos">Gastos Médicos</option>
                <option value="Auto">Auto</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
              <th className="px-6 py-4">Est</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Póliza</th>
              <th className="px-6 py-4">Ramo</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Vigencia</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {filteredPolicies.length > 0 ? (
              filteredPolicies.map((policy) => {
                const category = getExpirationCategory(policy.vigencia);
                const daysDiff = getDaysDifference(policy.vigencia);
                const isCritical = category === 'critical' || category === 'expired';

                return (
                  <tr
                    key={policy.id}
                    className={`group transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 
                      ${isCritical ? 'bg-red-50/40 dark:bg-red-900/10' : ''}
                      ${category === 'warning' ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''}
                    `}
                  >
                    <td className="px-6 py-4">
                      {isCritical && <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" title="Crítico/Vencido" />}
                      {category === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" title="Por vencer" />}
                      {category === 'upcoming' && <Calendar className="w-5 h-5 text-blue-500" title="Próximo vencimiento" />}
                      {category === 'ok' && <CheckCircle2 className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-slate-200">{policy.nombre}</span>
                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{policy.telefono}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {policy.poliza}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getRamoBadgeColor(policy.ramo)}`}>
                        {policy.ramo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {policy.producto}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium 
                          ${isCritical ? 'text-red-600 dark:text-red-400' : ''}
                          ${category === 'warning' ? 'text-amber-600 dark:text-amber-400' : ''}
                          ${category === 'upcoming' || category === 'ok' ? 'text-slate-600 dark:text-slate-400' : ''}
                        `}>
                          {formatDate(policy.vigencia)}
                        </span>
                        {(isCritical || category === 'warning' || category === 'upcoming') && (
                          <span className={`text-[10px] font-medium 
                            ${isCritical ? 'text-red-500' : ''}
                            ${category === 'warning' ? 'text-amber-500' : ''}
                            ${category === 'upcoming' ? 'text-blue-500' : ''}
                          `}>
                            {daysDiff < 0 ? `Venció hace ${Math.abs(daysDiff)} días` :
                              daysDiff === 0 ? '¡Vence hoy!' :
                                `En ${daysDiff} días`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(policy)}
                            className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                            title="Editar póliza"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(policy)}
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                            title="Eliminar póliza"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-8 h-8 mb-3 opacity-20" />
                    <p>No se encontraron pólizas con los filtros actuales.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 text-xs text-slate-400 flex justify-between items-center">
        <span>Mostrando {filteredPolicies.length} registros</span>
        <div className="flex gap-2">
          {/* Pagination placeholder */}
          <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors" disabled>Anterior</button>
          <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors" disabled>Siguiente</button>
        </div>
      </div>
    </div>
  );
};