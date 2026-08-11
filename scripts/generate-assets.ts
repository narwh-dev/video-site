import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  MANIFEST,
  MOVIE_EPISODE_CODE,
  assetColorForIndex,
  episodeCode,
  type ManifestEntry,
} from '../src/data/manifest.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ASSETS = join(ROOT, 'public', 'assets')

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true })
}

function textColorForBg(bg: string): string {
  if (bg === '#111111' || bg === '#3B82F6') return '#ffffff'
  return '#111111'
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapTitle(text: string, maxChars: number, maxLines: number): string[] {
  if (text.length <= maxChars) return [text]
  const lines: string[] = []
  let remaining = text
  while (remaining.length > 0 && lines.length < maxLines) {
    if (remaining.length <= maxChars) {
      lines.push(remaining)
      break
    }
    let breakAt = maxChars
    const slice = remaining.slice(0, maxChars + 1)
    const lastSpace = slice.lastIndexOf(' ')
    if (lastSpace > maxChars * 0.4) {
      breakAt = lastSpace
    }
    lines.push(remaining.slice(0, breakAt).trim())
    remaining = remaining.slice(breakAt).trim()
  }
  if (remaining.length > 0 && lines.length === maxLines) {
    const last = lines[maxLines - 1]
    if (last !== undefined) {
      lines[maxLines - 1] =
        last.length > 1 ? last.slice(0, -1) + '…' : last
    }
  }
  return lines
}

function titleCardSvg(opts: {
  width: number
  height: number
  bg: string
  code: string
  zhTitle: string
  enOrYear: string
  insetPct?: number
}): string {
  const { width, height, bg, code, zhTitle, enOrYear } = opts
  const inset = opts.insetPct ?? 0.12
  const padX = Math.round(width * inset)
  const padY = Math.round(height * inset)
  const fg = textColorForBg(bg)
  const zhLines = wrapTitle(zhTitle, 12, 2)
  const lineHeight = Math.max(18, Math.round(height * 0.035))
  const baseY = height - padY - (zhLines.length > 1 ? lineHeight * 2.2 : lineHeight * 1.2)
  const enY = height - padY

  const zhTspans = zhLines
    .map(
      (line, i) =>
        `<tspan x="${padX}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bg}"/>
  <rect x="${padX}" y="${padY}" width="${width - padX * 2}" height="${height - padY * 2}" fill="none" stroke="${fg}" stroke-opacity="0.35" stroke-width="2"/>
  <text x="${padX}" y="${padY + Math.round(height * 0.04)}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="${Math.max(14, Math.round(height * 0.04))}" fill="${fg}" font-weight="500">${escapeXml(code)}</text>
  <text x="${padX}" y="${baseY}" font-family="system-ui, -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" font-size="${Math.max(16, Math.round(height * 0.045))}" fill="${fg}" font-weight="700">${zhTspans}</text>
  <text x="${padX}" y="${enY}" font-family="system-ui, -apple-system, 'PingFang SC', sans-serif" font-size="${Math.max(12, Math.round(height * 0.03))}" fill="${fg}" opacity="0.85">${escapeXml(enOrYear)}</text>
</svg>
`
}

function avatarSvg(initial: string, bg: string, size = 96): string {
  const fg = textColorForBg(bg)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${bg}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="${Math.round(size * 0.42)}" font-weight="700" fill="${fg}">${escapeXml(initial)}</text>
</svg>
`
}

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function spriteSvg(): string {
  const cols = 5
  const rows = 5
  const frameW = 320
  const frameH = 72
  const width = cols * frameW
  const height = rows * frameH
  const colors = ['#111111', '#3B82F6', '#FB923C', '#34D399'] as const
  const frames: string[] = []

  for (let i = 0; i < cols * rows; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * frameW
    const y = row * frameH
    const bg = colors[i % colors.length] ?? '#111111'
    const fg = textColorForBg(bg)
    const label = formatMmSs(i * 60)
    frames.push(`
  <g transform="translate(${x},${y})">
    <rect width="${frameW}" height="${frameH}" fill="${bg}"/>
    <rect x="8" y="8" width="${frameW - 16}" height="${frameH - 16}" fill="none" stroke="${fg}" stroke-opacity="0.35" stroke-width="1.5"/>
    <text x="16" y="${frameH / 2 + 5}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="18" fill="${fg}" font-weight="600">${label}</text>
    <text x="${frameW - 16}" y="${frameH / 2 + 5}" text-anchor="end" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="12" fill="${fg}" opacity="0.7">#${String(i).padStart(2, '0')}</text>
  </g>`)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${frames.join('\n')}
</svg>
`
}

function writeSvg(relPath: string, content: string) {
  const full = join(ASSETS, relPath)
  ensureDir(dirname(full))
  writeFileSync(full, content, 'utf8')
}

function generateForEntry(entry: ManifestEntry, index: number) {
  const bg = assetColorForIndex(index)
  const enOrYear = entry.title.en ?? String(entry.year)

  writeSvg(
    `posters/${entry.slug}.svg`,
    titleCardSvg({
      width: 600,
      height: 900,
      bg,
      code: entry.code,
      zhTitle: entry.title.zhHans,
      enOrYear,
    }),
  )

  writeSvg(
    `backdrops/${entry.slug}.svg`,
    titleCardSvg({
      width: 1260,
      height: 540,
      bg,
      code: entry.code,
      zhTitle: entry.title.zhHans,
      enOrYear,
    }),
  )

  if (entry.kind === 'movie') {
    writeSvg(
      `thumbnails/${entry.slug}-${MOVIE_EPISODE_CODE}.svg`,
      titleCardSvg({
        width: 640,
        height: 360,
        bg,
        code: MOVIE_EPISODE_CODE,
        zhTitle: entry.title.zhHans,
        enOrYear,
      }),
    )
  } else if (entry.seasons) {
    entry.seasons.forEach((epCount, seasonIdx) => {
      const season = seasonIdx + 1
      for (let ep = 1; ep <= epCount; ep++) {
        const code = episodeCode(season, ep)
        writeSvg(
          `thumbnails/${entry.slug}-${code}.svg`,
          titleCardSvg({
            width: 640,
            height: 360,
            bg,
            code,
            zhTitle: entry.title.zhHans,
            enOrYear: `${enOrYear} · ${code}`,
          }),
        )
      }
    })
  }
}

function main() {
  ensureDir(join(ASSETS, 'posters'))
  ensureDir(join(ASSETS, 'backdrops'))
  ensureDir(join(ASSETS, 'thumbnails'))
  ensureDir(join(ASSETS, 'avatars'))

  MANIFEST.forEach((entry, index) => {
    generateForEntry(entry, index)
  })

  writeSvg('avatars/u-member.svg', avatarSvg('舟', assetColorForIndex(0)))
  writeSvg('avatars/u-admin.svg', avatarSvg('管', assetColorForIndex(1)))
  writeSvg('avatars/u-uploader.svg', avatarSvg('传', assetColorForIndex(2)))

  writeSvg('sprite.svg', spriteSvg())

  writeFileSync(
    join(ASSETS, 'README.md'),
    'These SVG assets are generated by `scripts/generate-assets.ts` and are fully deterministic. They are placeholder title-cards for the Starfleet Archive prototype; replace them later with licensed artwork while preserving the same aspect ratios (posters 2:3, backdrops 21:9, thumbnails 16:9, avatars 1:1, sprite 1600×360).\n',
    'utf8',
  )

  console.log('Assets generated under public/assets/')
}

main()