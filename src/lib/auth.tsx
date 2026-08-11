import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const SIGNED_OUT_KEY = 'starfleet-signed-out'

interface AuthContextValue {
  signedIn: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readSignedOut(): boolean {
  try {
    return sessionStorage.getItem(SIGNED_OUT_KEY) === '1'
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signedOut, setSignedOut] = useState(() => readSignedOut())

  const signIn = useCallback(() => {
    try {
      sessionStorage.removeItem(SIGNED_OUT_KEY)
    } catch {
    }
    setSignedOut(false)
  }, [])

  const signOut = useCallback(() => {
    try {
      sessionStorage.setItem(SIGNED_OUT_KEY, '1')
    } catch {
    }
    setSignedOut(true)
  }, [])

  const value = useMemo(
    () => ({
      signedIn: !signedOut,
      signIn,
      signOut,
    }),
    [signedOut, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
