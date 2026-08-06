import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  alt?: string
}

/**
 * Theme-aware DigiAyudh logo.
 * Shows the dark logo in dark mode and the light logo in light mode.
 */
export function Logo({ className, alt = 'DigiAyudh Logo' }: LogoProps) {
  const { theme } = useTheme()

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <img
      src={isDark ? '/Dark-ayudh-logo.jpeg' : '/Lite-ayudh-logo.jpeg'}
      alt={alt}
      className={cn('h-8 w-8 rounded-lg object-cover', className)}
    />
  )
}
