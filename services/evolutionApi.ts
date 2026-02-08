// Evolution API Service for WhatsApp messaging
const EVOLUTION_API_URL = 'https://evolutionapi-evolution-api.ckoomq.easypanel.host';
const EVOLUTION_API_KEY = '429683C4C977415CAAFCCE10F7D57E11';
const EVOLUTION_INSTANCE_NAME = 'claveai';

export interface SendMessageParams {
    phone: string;
    message: string;
}

export interface SendMessageResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Normaliza el número de teléfono para Evolution API
 * @param phone - Número de teléfono en cualquier formato
 * @returns Número normalizado (ej: 521234567890)
 */
function normalizePhone(phone: string): string {
    // Remover todo excepto números
    let cleaned = phone.replace(/\D/g, '');

    // Si empieza con 52 (México), está bien
    // Si no, agregar 52
    if (!cleaned.startsWith('52')) {
        cleaned = '52' + cleaned;
    }

    return cleaned;
}

/**
 * Envía un mensaje de WhatsApp usando Evolution API
 */
export async function sendWhatsAppMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    const normalizedPhone = normalizePhone(params.phone);

    try {
        const response = await fetch(
            `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY,
                },
                body: JSON.stringify({
                    number: normalizedPhone,
                    text: params.message,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.message || `Error ${response.status}: ${response.statusText}`,
            };
        }

        const data = await response.json();
        return {
            success: true,
            messageId: data.key?.id || data.messageId,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Genera el mensaje de felicitación de cumpleaños
 */
export function generateBirthdayMessage(nombre: string): string {
    const firstName = nombre.split(' ')[0];
    return `¡Feliz cumpleaños ${firstName}! 🎂🎉\n\nDe parte de todo el equipo de SegurosPremium, te deseamos un día lleno de alegría y bendiciones.\n\n¡Que todos tus deseos se cumplan! 🌟`;
}

/**
 * Verifica si hoy es el cumpleaños de la persona
 * Maneja correctamente las zonas horarias parseando el string directamente
 */
export function isBirthdayToday(fechaNacimiento: string): boolean {
    if (!fechaNacimiento) return false;

    const today = new Date();
    const todayMonth = today.getMonth() + 1; // getMonth() es 0-indexado
    const todayDay = today.getDate();

    // Parsear la fecha directamente del string (formato YYYY-MM-DD)
    const parts = fechaNacimiento.split('-');
    if (parts.length !== 3) return false;

    const birthdayMonth = parseInt(parts[1], 10);
    const birthdayDay = parseInt(parts[2], 10);

    return todayMonth === birthdayMonth && todayDay === birthdayDay;
}

/**
 * Obtiene los días restantes para el próximo cumpleaños
 * Maneja correctamente las zonas horarias
 */
export function daysUntilBirthday(fechaNacimiento: string): number {
    if (!fechaNacimiento) return -1;

    // Parsear la fecha directamente del string (formato YYYY-MM-DD)
    const parts = fechaNacimiento.split('-');
    if (parts.length !== 3) return -1;

    const birthdayMonth = parseInt(parts[1], 10) - 1; // Ajustar a 0-indexado para Date
    const birthdayDay = parseInt(parts[2], 10);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche

    // Crear fecha de cumpleaños en el año actual
    const birthday = new Date(today.getFullYear(), birthdayMonth, birthdayDay);

    // Si ya pasó este año, usar el próximo año
    if (birthday < today) {
        birthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = birthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}
