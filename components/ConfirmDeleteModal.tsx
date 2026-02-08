import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    policyName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    policyName,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all border border-slate-100 dark:border-slate-700">
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>

                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white text-center mb-2">
                        ¿Eliminar póliza?
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                        Estás a punto de eliminar la póliza de <strong className="text-slate-800 dark:text-white">{policyName}</strong>.
                        Esta acción no se puede deshacer.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors active:scale-95"
                        >
                            Sí, eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
