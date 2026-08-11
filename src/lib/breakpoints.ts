import { useCallback, useSyncExternalStore } from 'react'

function subscribeToQuery(query: string, onStoreChange: () => void): () => void {
  const media = window.matchMedia(query)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

function getQuerySnapshot(query: string): boolean {
  return window.matchMedia(query).matches
}

function getServerSnapshot(): boolean {
  return false
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToQuery(query, onStoreChange),
    [query],
  )
  const getSnapshot = useCallback(() => getQuerySnapshot(query), [query])
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}
