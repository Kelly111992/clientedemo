import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Sun className="h-5 w-5 text-amber-500" />
            ) : (
                <Moon className="h-5 w-5 text-indigo-300" />
            )}
        </button>
    );
}
