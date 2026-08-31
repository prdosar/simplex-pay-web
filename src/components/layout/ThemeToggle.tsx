'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const THEME_KEY = 'spx-theme'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      className={`w-9 h-9 shrink-0 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/50 flex items-center justify-center transition-colors ${className}`}
    >
      {mounted ? (
        isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
      ) : (
        <span className="w-4 h-4" />
      )}
    </button>
  )
}
