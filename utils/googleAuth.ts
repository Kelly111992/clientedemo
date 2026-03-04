import { googleLogout } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '609353558960-pf3hb0u4tpj4adt1qgbuioav9pv6c634.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;

interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

export const exchangeCodeForToken = async (code: string): Promise<TokenResponse | null> => {
    if (!GOOGLE_CLIENT_SECRET) {
        console.error('VITE_GOOGLE_CLIENT_SECRET not found in .env');
        return null;
    }

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: 'postmessage',
                grant_type: 'authorization_code',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Token exchange failed:', errorData);
            throw new Error(errorData.error_description || 'Failed to exchange token');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        return null;
    }
};

export const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
    if (!GOOGLE_CLIENT_SECRET) {
        console.error('VITE_GOOGLE_CLIENT_SECRET not found in .env');
        return null;
    }

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            // If refresh fails (e.g., revoked), clear storage
            if (response.status === 400 || response.status === 401) {
                localStorage.removeItem('google_refresh_token');
                localStorage.removeItem('google_access_token');
            }
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
};
