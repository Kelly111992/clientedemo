import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Policy, RamoType } from '../types';
import { RAMO_OPTIONS } from '../constants';

interface AddPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (policy: Omit<Policy, 'id'>) => void;
}

export const AddPolicyModal: React.FC<AddPolicyModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    poliza: '',
    ramo: 'Vida' as RamoType,
    producto: '',
    vigencia: '',
    fechaNacimiento: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
    // Reset form
    setFormData({
      nombre: '',
      telefono: '',
      poliza: '',
      ramo: 'Vida',
      producto: '',
      vigencia: '',
      fechaNacimiento: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden transform transition-all border border-slate-100 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Nueva Póliza</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-slate-900 dark:text-white placeholder-slate-400"
              placeholder="Ej. Juan Pérez"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
              <input
                required
                type="tel"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="10 dígitos"
                value={formData.telefono}
                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">No. Póliza</label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Ej. 90145601"
                value={formData.poliza}
                onChange={e => setFormData({ ...formData, poliza: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ramo</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                value={formData.ramo}
                onChange={e => setFormData({ ...formData, ramo: e.target.value as RamoType })}
              >
                {RAMO_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Producto</label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Ej. Amplia"
                value={formData.producto}
                onChange={e => setFormData({ ...formData, producto: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha de Vigencia (Vencimiento)</label>
            <input
              required
              type="date"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-600 dark:text-slate-300"
              value={formData.vigencia}
              onChange={e => setFormData({ ...formData, vigencia: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha de Nacimiento (Opcional) 🎂</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-slate-600 dark:text-slate-300"
              value={formData.fechaNacimiento}
              onChange={e => setFormData({ ...formData, fechaNacimiento: e.target.value })}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Para enviar felicitaciones automáticas</p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
            >
              Guardar Póliza
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};