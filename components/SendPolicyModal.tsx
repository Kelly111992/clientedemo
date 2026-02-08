import React, { useState, useRef } from 'react';
import { Policy } from '../types';
import { X, Upload, FileText, Send, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { PROMOTION_TEMPLATES, getPromotionMessage } from '../data/promotions';
import { sendWhatsAppMedia } from '../services/evolutionApi';

interface SendPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policy: Policy | null;
}

type SendingStatus = 'idle' | 'converting' | 'sending' | 'success' | 'error';

export const SendPolicyModal: React.FC<SendPolicyModalProps> = ({ isOpen, onClose, policy }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(PROMOTION_TEMPLATES[0].id);
    const [customMessage, setCustomMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<SendingStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (isOpen && policy) {
            setCustomMessage(PROMOTION_TEMPLATES[0].text.replace('{nombre}', policy.nombre.split(' ')[0]));
            setSelectedTemplate(PROMOTION_TEMPLATES[0].id);
            setFile(null);
            setStatus('idle');
            setErrorMessage('');
        }
    }, [isOpen, policy]);

    // Update message when template changes
    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplate(templateId);
        if (policy) {
            setCustomMessage(getPromotionMessage(templateId, policy.nombre));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove data URL prefix (e.g., "data:application/pdf;base64,")
                const base64 = reader.result as string;
                const base64Data = base64.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleSend = async () => {
        if (!policy || !file) return;

        setStatus('converting');
        try {
            const base64Data = await convertFileToBase64(file);

            setStatus('sending');
            const result = await sendWhatsAppMedia({
                phone: policy.telefono,
                media: base64Data,
                fileName: file.name,
                mimeType: file.type,
                caption: customMessage
            });

            if (result.success) {
                setStatus('success');
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setStatus('error');
                setErrorMessage(result.error || 'Error al enviar mensaje');
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage('Error al procesar el archivo');
            console.error(error);
        }
    };

    if (!isOpen || !policy) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            Enviar Póliza
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Para: <span className="font-medium text-slate-700 dark:text-slate-300">{policy.nombre}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {/* 1. File Upload */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                            1. Selecciona el archivo de la póliza (PDF/Imagen)
                        </label>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${file
                                    ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20'
                                    : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:border-slate-500'
                                }
              `}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                            />

                            {file ? (
                                <div className="flex items-center justify-center gap-3 text-indigo-700 dark:text-indigo-300">
                                    <FileText className="w-8 h-8" />
                                    <div className="text-left">
                                        <p className="font-semibold text-sm truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-xs opacity-70">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="p-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full ml-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-slate-500 dark:text-slate-400">
                                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Click para subir archivo</p>
                                    <p className="text-xs opacity-70 mt-1">Soporta PDF, PNG, JPG</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Message Template */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                            2. Elige una estrategia de mensaje (Promoción)
                        </label>

                        <div className="grid grid-cols-1 gap-2">
                            {PROMOTION_TEMPLATES.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => handleTemplateChange(template.id)}
                                    className={`
                    p-3 rounded-lg border text-left text-sm transition-all flex items-center gap-3
                    ${selectedTemplate === template.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                                        }
                  `}
                                >
                                    <span className="text-xl">{template.emoji}</span>
                                    <span className="font-medium">{template.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Message Preview */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Vista previa del mensaje
                        </label>
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:text-slate-200"
                            placeholder="El mensaje aparecerá aquí..."
                        />
                    </div>

                    {/* Error Message */}
                    {status === 'error' && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                            <X className="w-4 h-4" />
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        disabled={status === 'sending' || status === 'converting' || status === 'success'}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!file || !customMessage || status === 'sending' || status === 'converting' || status === 'success'}
                        className={`
              px-6 py-2 rounded-xl text-white font-medium text-sm shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 transition-all
              ${status === 'success'
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
                            }
            `}
                    >
                        {status === 'converting' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Procesando archivo...
                            </>
                        ) : status === 'sending' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enviando WhatsApp...
                            </>
                        ) : status === 'success' ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                ¡Enviado con éxito!
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Enviar Póliza
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
