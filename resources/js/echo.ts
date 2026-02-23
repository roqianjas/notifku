import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo;
    }
}

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080'),
    wssPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080'),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    // Auto-reconnect settings
    cluster: '',
    disableStats: true,
    enableLogging: false,
    activityTimeout: 120000,     // 120 detik sebelum dianggap mati
    pongTimeout: 10000,          // 10 detik tunggu pong response
});
