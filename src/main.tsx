import { Buffer } from 'buffer';
import process from 'process';

declare global {
    interface Window {
        Buffer: typeof Buffer;
        process: typeof process;
        global: typeof window;
    }
}

window.Buffer = Buffer;
window.process = process;
window.global = window;

if (!window.process?.nextTick) {
    window.process.nextTick = function (callback) {
        setTimeout(callback, 0);
    };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
