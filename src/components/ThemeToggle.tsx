'use client';

import React from 'react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-4 h-4" />;
    }
    return resolvedTheme === 'dark' ? (
      <Moon className="w-4 h-4" />
    ) : (
      <Sun className="w-4 h-4" />
    );
  };

  const getLabel = () => {
    if (theme === 'system') {
      return `System (${resolvedTheme})`;
    }
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <AnimatedButton
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      title={`Current theme: ${getLabel()}. Click to cycle through themes.`}
      aria-label={`Switch theme. Current: ${getLabel()}`}
      data-tour="theme-toggle"
    >
      {getIcon()}
      <span className="hidden sm:inline text-sm">{getLabel()}</span>
    </AnimatedButton>
  );
}

export function ThemeToggleCompact() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-4 h-4" />;
    }
    return resolvedTheme === 'dark' ? (
      <Moon className="w-4 h-4" />
    ) : (
      <Sun className="w-4 h-4" />
    );
  };

  return (
    <AnimatedButton
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="text-muted-foreground hover:text-foreground w-10 h-10 p-0"
      title={`Current theme: ${theme === 'system' ? `System (${resolvedTheme})` : theme}. Click to cycle through themes.`}
      aria-label={`Switch theme. Current: ${theme === 'system' ? `System (${resolvedTheme})` : theme}`}
    >
      {getIcon()}
    </AnimatedButton>
  );
}
