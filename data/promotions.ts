
export interface PromotionTemplate {
    id: string;
    label: string;
    emoji: string;
    text: string;
}

export const PROMOTION_TEMPLATES: PromotionTemplate[] = [
    {
        id: 'default',
        label: 'Envío Simple',
        emoji: '📄',
        text: "Hola {nombre}, aquí te adjunto tu póliza renovada. \n\nCualquier duda estoy a tus órdenes. ¡Saludos! 👋"
    },
    {
        id: 'cross-auto-vida',
        label: 'Tiene Auto -> Ofrecer Vida',
        emoji: '🛡️',
        text: "Hola {nombre}, aquí tienes tu póliza de Auto 🚗. \n\n¿Sabías que por ser buen conductor calificas para un descuento especial en un Seguro de Vida? Protege el futuro de tu familia desde hoy. \n\n¿Te gustaría una cotización rápida? Sólo dime 'Sí' y te la envío. 👨‍👩‍👧"
    },
    {
        id: 'cross-gmm-auto',
        label: 'Tiene GMM -> Ofrecer Auto',
        emoji: '🚗',
        text: "Hola {nombre}, adjunto tu póliza de Gastos Médicos 🏥. \n\nAprovechando, noté que tenemos una promoción exclusiva para asegurar tu vehículo con cobertura amplia plus. \n\n¿Me permites cotizarte sin compromiso para que compares? 🚙💨"
    },
    {
        id: 'referidos',
        label: 'Solicitar Referidos',
        emoji: '🤝',
        text: "Hola {nombre}, aquí está tu póliza lista ✅. \n\nSi estás contento con mi servicio, ¿conoces a alguien (amigo o familiar) a quien le pueda servir una asesoría como esta? \n\n¡Te lo agradecería mucho! 🙏"
    },
    {
        id: 'vida-ahorro',
        label: 'Ofrecer Ahorro/Retiro',
        emoji: '💰',
        text: "Queda entregada tu póliza {nombre} ✅. \n\nAdemás de protegerte hoy, ¿ya has pensado en tu 'Yo del futuro'? Tenemos planes de ahorro con rendimientos garantizados para tu retiro. \n\n¿Te interesa conocer un simulador de cuánto podrías acumular? 📈"
    }
];

export const getPromotionMessage = (templateId: string, clientName: string): string => {
    const template = PROMOTION_TEMPLATES.find(t => t.id === templateId);
    if (!template) return '';

    // Obtener solo el primer nombre para hacerlo más personal
    const firstName = clientName.split(' ')[0];
    return template.text.replace('{nombre}', firstName);
};
