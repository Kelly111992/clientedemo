import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, AlertCircle, FileText } from 'lucide-react';
import { StatsData } from '../types';

interface DashboardStatsProps {
  stats: StatsData;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Policies Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Pólizas</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.totalPolicies}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-400">
          Activos en cartera
        </div>
      </div>

      {/* Expiring Soon Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Por Vencer (30 días)</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.expiringSoon}</h3>
          </div>
          <div className={`p-3 rounded-lg ${stats.expiringSoon > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <AlertCircle className={`w-6 h-6 ${stats.expiringSoon > 0 ? 'text-red-500' : 'text-green-500'}`} />
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-400">
          Requieren atención inmediata
        </div>
      </div>

      {/* Distribution Chart Card */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow min-h-[160px]">
        <h4 className="text-sm font-medium text-slate-500 mb-2">Distribución por Ramo</h4>
        <div className="flex-1 w-full h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.byRamo}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.byRamo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};