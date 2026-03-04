import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Policy } from '../types';
import { getExpirationCategory } from './dateUtils';

export const generatePortfolioPDF = (policies: Policy[]) => {
    const doc = new jsPDF();

    // --- Header ---
    // Title
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('Reporte de Cartera General', 14, 20);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const date = new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    doc.text(date, 14, 28);

    // Agency Name (Simulated Logo area)
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text('CLAVE.AI SEGUROS', 160, 20);

    // --- Summary ---
    const totalPolicies = policies.length;
    // Calculate status dynamically
    const activePolicies = policies.filter(p => {
        const cat = getExpirationCategory(p.vigencia);
        return cat !== 'expired' && cat !== 'critical';
    }).length;

    // We don't have amount in Policy interface, so we'll omit total premium or mock it if needed.
    // For now, let's show Total policies and Active policies.

    doc.setFillColor(243, 244, 246); // Gray-100
    doc.roundedRect(14, 35, 180, 25, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Pólizas', 20, 42);
    doc.text('Vigentes', 80, 42);
    doc.text('Por Vencer (< 30 días)', 140, 42); // Replaced Premium with 'Expired/Critical' count or similar

    const expiringSoon = policies.filter(p => getExpirationCategory(p.vigencia) === 'warning' || getExpirationCategory(p.vigencia) === 'critical').length;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(totalPolicies.toString(), 20, 52);
    doc.text(activePolicies.toString(), 80, 52);
    doc.text(expiringSoon.toString(), 140, 52);

    // --- Table ---
    const tableData = policies.map(policy => {
        const cat = getExpirationCategory(policy.vigencia);
        const statusLabel = cat === 'expired' || cat === 'critical' ? 'Vencida/Crítica' :
            cat === 'warning' ? 'Por Vencer' : 'Vigente';

        return [
            policy.nombre,
            policy.poliza,
            policy.ramo,
            policy.producto,
            new Date(policy.vigencia).toLocaleDateString(),
            statusLabel
        ];
    });

    autoTable(doc, {
        startY: 70,
        head: [['Cliente', 'Póliza', 'Ramo', 'Producto', 'Vigencia', 'Estatus']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        styles: { fontSize: 9, cellPadding: 3 },
    });

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generado por CLAVE.AI CRM', 14, doc.internal.pageSize.height - 10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }

    // Save
    doc.save(`cartera_clientes_${new Date().toISOString().split('T')[0]}.pdf`);
};
