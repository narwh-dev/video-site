import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import { ArrowLeft } from 'lucide-react'
import { searchCatalog, searchEpisodes } from '@/data/index.ts'
import type { Episode, Series } from '@/data/index.ts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs'
import { normalizeText } from '@/lib/domain/text.ts'
import { useNavigate } from '@/lib/router/react.tsx'
import { cn } from '@/lib/utils'

type SearchScope = 'all' | 'series' | 'episodes'

type SeriesOption = {
  kind: 'series'
  id: string
  series: Series
  title: string
  meta: string
  imageSrc: string
}

type EpisodeOption = {
  kind: 'episode'
  id: string
  series: Series
  episode: Episode
  title: string
  meta: string
  imageSrc: string
}

type SearchOption = SeriesOption | EpisodeOption

function toSeriesOption(series: Series): SeriesOption {
  return {
    kind: 'series',
    id: `series:${series.slug}`,
    series,
    title: series.title.zhHans,
    meta: `${series.year} · ${series.seasons.length} 季`,
    imageSrc: `/assets/posters/${series.slug}.svg`,
  }
}

function toEpisodeOption(series: Series, episode: Episode): EpisodeOption {
  return {
    kind: 'episode',
    id: `episode:${series.slug}:${episode.code}`,
    series,
    episode,
    title: episode.title.zhHans,
    meta: `${series.title.zhHans} · ${episode.code}`,
    imageSrc: `/assets/thumbnails/${series.slug}-${episode.code}.svg`,
  }
}

function computeResults(rawQuery: string, scope: SearchScope): SearchOption[] {
  const q = normalizeText(rawQuery)
  if (!q) {
    return []
  }

  if (scope === 'series') {
    return searchCatalog({ q, kind: 'all' }).slice(0, 8).map(toSeriesOption)
  }

  if (scope === 'episodes') {
    return searchEpisodes(q)
      .slice(0, 8)
      .map(({ series, episode }) => toEpisodeOption(series, episode))
  }

  const seriesOptions = searchCatalog({ q, kind: 'all' })
    .slice(0, 6)
    .map(toSeriesOption)
  const episodeOptions = searchEpisodes(q)
    .slice(0, 6)
    .map(({ series, episode }) => toEpisodeOption(series, episode))
  return [...seriesOptions, ...episodeOptions]
}

export function SidebarSearch({
  onClose,
  triggerRef,
}: {
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
}) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SearchScope>('all')
  const [activeIndex, setActiveIndex] = useState(-1)
  const composingRef = useRef(false)

  const results = useMemo(() => computeResults(query, scope), [query, scope])

  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1)
  }, [results])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const closeAndRefocus = useCallback(() => {
    onClose()
    queueMicrotask(() => {
      triggerRef.current?.focus()
    })
  }, [onClose, triggerRef])

  const activateOption = useCallback(
    (option: SearchOption) => {
      if (option.kind === 'series') {
        navigate(`/series/${option.series.slug}`)
      } else {
        navigate(`/watch/${option.series.slug}/${option.episode.code}`)
      }
      onClose()
    },
    [navigate, onClose],
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeAndRefocus()
      return
    }

    if (results.length === 0) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => {
        if (prev < 0) return 0
        return (prev + 1) % results.length
      })
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => {
        if (prev < 0) return results.length - 1
        return (prev - 1 + results.length) % results.length
      })
      return
    }

    if (event.key === 'Enter') {
      if (composingRef.current || event.nativeEvent.isComposing) {
        return
      }
      event.preventDefault()
      const option = activeIndex >= 0 ? results[activeIndex] : undefined
      if (option) {
        activateOption(option)
      }
    }
  }

  const trimmed = query.trim()
  const activeOptionId =
    activeIndex >= 0 ? `search-option-${activeIndex}` : undefined

  return (
    <div role="search" aria-label="档案搜索" className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="返回导航"
          onClick={closeAndRefocus}
        >
          <ArrowLeft />
        </Button>
        <Input
          ref={inputRef}
          nativeInput
          size="sm"
          role="combobox"
          aria-expanded="true"
          aria-controls="sidebar-search-listbox"
          aria-activedescendant={activeOptionId}
          autoFocus
          placeholder="搜索系列、单集…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            composingRef.current = true
          }}
          onCompositionEnd={() => {
            composingRef.current = false
          }}
          className="flex-1"
        />
      </div>

      <div className="px-3 pb-2">
        <Tabs
          value={scope}
          onValueChange={(value) => {
            if (value === 'all' || value === 'series' || value === 'episodes') {
              setScope(value)
            }
          }}
        >
          <TabsList aria-label="搜索范围" className="w-full">
            <TabsTab value="all" className="h-7 flex-1 px-2 text-[12px]">
              全部
            </TabsTab>
            <TabsTab value="series" className="h-7 flex-1 px-2 text-[12px]">
              系列
            </TabsTab>
            <TabsTab value="episodes" className="h-7 flex-1 px-2 text-[12px]">
              单集
            </TabsTab>
          </TabsList>
        </Tabs>
      </div>

      <p
        className="px-3 pb-2 text-[12px] text-muted-foreground"
        aria-live="polite"
      >
        {trimmed ? `找到 ${results.length} 个结果` : '输入关键词以搜索档案'}
      </p>

      <div className="min-h-0 flex-1 px-2 pb-3">
        {trimmed && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
            <p className="text-[13px] text-muted-foreground">未找到匹配内容</p>
            <p className="text-[12px] text-muted-foreground">
              试试其他关键词或浏览剧集目录
            </p>
          </div>
        ) : results.length > 0 ? (
          <ScrollArea className="h-full">
            <div
              role="listbox"
              id="sidebar-search-listbox"
              aria-label="搜索结果"
              className="flex flex-col gap-0.5"
            >
              {results.map((option, index) => {
                const selected = index === activeIndex
                return (
                  <div
                    key={option.id}
                    id={`search-option-${index}`}
                    role="option"
                    aria-selected={selected}
                    data-highlighted={selected ? '' : undefined}
                    className={cn(
                      'grid cursor-pointer grid-cols-[auto_1fr] items-center gap-3 rounded-[10px] p-2 transition-colors duration-[120ms]',
                      selected && 'bg-secondary',
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => activateOption(option)}
                  >
                    <img
                      src={option.imageSrc}
                      alt=""
                      className={cn(
                        'object-cover',
                        option.kind === 'series'
                          ? 'aspect-[2/3] w-9 rounded-[4px]'
                          : 'aspect-video w-16 rounded-[4px]',
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] text-foreground">
                        {option.title}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {option.kind === 'episode' ? (
                          <>
                            {option.series.title.zhHans}
                            {' · '}
                            <span className="font-mono">
                              {option.episode.code}
                            </span>
                          </>
                        ) : (
                          option.meta
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        ) : null}
      </div>
    </div>
  )
}
