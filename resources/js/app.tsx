import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { TooltipProvider } from '@/Components/ui/tooltip';
import '../css/app.css';
import './echo';

const appName = import.meta.env.VITE_APP_NAME || 'NotifKu';

createInertiaApp({
    title: (title) => `${title} — ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx')
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <TooltipProvider>
                <App {...props} />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#6366f1',
    },
});
