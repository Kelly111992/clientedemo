import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Plus, ShieldCheck } from 'lucide-react';
import { Policy, StatsData } from './types';
import { INITIAL_POLICIES, RAMO_COLORS } from './constants';
import { isExpiringSoon } from './utils/dateUtils';
import { DashboardStats } from './components/DashboardStats';
import { PolicyTable } from './components/PolicyTable';
import { AddPolicyModal } from './components/AddPolicyModal';

const App: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate Stats on the fly
  const stats: StatsData = useMemo(() => {
    const totalPolicies = policies.length;
    const expiringSoon = policies.filter(p => isExpiringSoon(p.vigencia)).length;
    
    // Calculate distribution
    const distributionMap = policies.reduce((acc, curr) => {
      acc[curr.ramo] = (acc[curr.ramo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byRamo = Object.entries(distributionMap).map(([name, value]) => ({
      name,
      value,
      color: RAMO_COLORS[name as keyof typeof RAMO_COLORS] || '#94a3b8'
    }));

    return { totalPolicies, expiringSoon, byRamo };
  }, [policies]);

  const handleAddPolicy = (newPolicyData: Omit<Policy, 'id'>) => {
    const newPolicy: Policy = {
      ...newPolicyData,
      id: Date.now().toString(), // Simple ID generation
    };
    setPolicies(prev => [...prev, newPolicy]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header / Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Seguros<span className="text-indigo-600">Premium</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               Sistema Activo
             </div>
             <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://picsum.photos/100/100" alt="User Profile" className="h-full w-full object-cover" />
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-slate-400" />
              Dashboard General
            </h2>
            <p className="text-slate-500 mt-1">Bienvenido de nuevo. Aquí está el resumen de tu cartera.</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Agregar Póliza
          </button>
        </div>

        {/* Stats Section */}
        <DashboardStats stats={stats} />

        {/* Policies Table */}
        <PolicyTable policies={policies} />

      </main>

      {/* Modals */}
      <AddPolicyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddPolicy} 
      />
    </div>
  );
};

export default App;