import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchCurrentUser } from '../redux/slices/authSlice'
import { useSession } from '@/hooks/useSession'
import { AuthProvider } from '@/contexts/auth.context'
import { Loader } from 'lucide-react'
import { tokenManager } from '@/utils/tokenManager'

interface AuthInitializerProps {
  children: React.ReactNode
}

function AuthInitializerContent({ children }: AuthInitializerProps) {
  const dispatch = useAppDispatch()
  const { initializing, token } = useAppSelector((state) => state.auth)
  const initAttemptedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  useSession() // Initialize session management

  useEffect(() => {
    // Prevent multiple init attempts
    if (initAttemptedRef.current) return

    if (token) {
      initAttemptedRef.current = true
      if (tokenManager.isSessionValid()) {
        dispatch(fetchCurrentUser())
        // Safety timeout: if init doesn't complete in 3 seconds, consider it done anyway
        timeoutRef.current = setTimeout(() => {
          console.log('[v0] Auth initialization timeout - forcing completion')
        }, 3000)
      } else {
        // Invalid or expired session, clear it
        tokenManager.clearTokens()
      }
    } else {
      // No token, initialization complete
      initAttemptedRef.current = true
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [token, dispatch])

  if (initializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-primary mx-auto mb-4" size={40} />
          <p className="text-text-light">Initializing...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  return (
    <AuthProvider>
      <AuthInitializerContent>{children}</AuthInitializerContent>
    </AuthProvider>
  )
}
