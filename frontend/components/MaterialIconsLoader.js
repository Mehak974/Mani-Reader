'use client';
import { useEffect } from 'react';

// Loads Material Icons stylesheet after first paint — non-blocking
// Replaces the <link onLoad> trick which doesn't work in Next.js Server Components
export default function MaterialIconsLoader() {
    useEffect(() => {
        const existing = document.querySelector(
            'link[href*="Material+Icons"]'
        );
        if (existing) return; // already loaded

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(link);
    }, []);

    return null;
}