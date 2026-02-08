import React, { useState } from 'react';
import { Policy, RamoType } from '../types';
import { Search, Filter, Phone, AlertTriangle } from 'lucide-react';
import { isExpiringSoon, formatDate } from '../utils/dateUtils';
import { RAMO_COLORS } from '../constants';

interface PolicyTableProps {
  policies: Policy[];
}

export const PolicyTable: React.FC<PolicyTableProps> = ({ policies }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRamo, setFilterRamo] = useState<RamoType | 'Todos'>('Todos');

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.poliza.includes(searchTerm);
    const matchesFilter = filterRamo === 'Todos' || policy.ramo === filterRamo;
    return matchesSearch && matchesFilter;
  });

  const getRamoBadgeColor = (ramo: string) => {
    switch (ramo) {
      case 'Vida': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'Gastos Médicos': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'Auto': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      default: return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
      {/* Table Header / Toolbar */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Cartera de Clientes</h3>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cliente o póliza..."
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 transition-all dark:text-white dark:placeholder-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter */}
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

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Póliza</th>
              <th className="px-6 py-4">Ramo</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4 text-right">Vigencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {filteredPolicies.length > 0 ? (
              filteredPolicies.map((policy) => {
                const expiring = isExpiringSoon(policy.vigencia);
                return (
                  <tr
                    key={policy.id}
                    className={`group transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${expiring ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                  >
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {expiring && (
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-xs font-medium animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Vence pronto</span>
                          </div>
                        )}
                        <span className={`text-sm font-medium ${expiring ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {formatDate(policy.vigencia)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
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